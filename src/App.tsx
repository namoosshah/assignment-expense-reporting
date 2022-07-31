import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import styled from 'styled-components';
import { Table } from './components/shared/Table';
import Papa from "papaparse";
import expenseList from './assets/expenses.csv';
import { Expense } from './interfaces/Expense';

const Container = styled.div`
  width: 80%;
  margin: 0 auto;
  padding: 1rem;
`

const DropDownContainer = styled.div`
  padding: 0.5rem 0;
  text-align: right;
  span {
    padding-right: 0.5rem;
    font-family: arial, sans-serif;
  }
  select {
    padding: 0.25rem 0.375rem;
    font-family: arial, sans-serif;
    border: 1px solid #e0e0e0;
    outline: none;
  }
`

function App() {

  const initialData: Expense[] = [];
  const [data, setData] = useState(initialData);
  const [tableData, setTableData] = useState(initialData);

  const fetchCsv = async () => {
    const response: any = await fetch(expenseList);
    let reader = response.body.getReader();
    let decoder = new TextDecoder('utf-8');

    return await reader.read().then(function (result: any) {
      return decoder.decode(result.value);
    });
  }

  useEffect(() => {
    fetchCsv().then((csvData: string) => {
      const result = Papa.parse(csvData);
      const parseData: any = result.data;
      parseData.splice(0, 1);
      const expenses: Expense[] = parseData.map((d: any) => {
        return {
          department: d[0],
          project: d[1],
          amount: Number(d[2].replace(',', '').replace('€', '')),
          date: d[3],
          member: d[4]
        }
      });
      expenses.sort((a: Expense, b: Expense) => (a.department > b.department) ? 1 : ((b.department > a.department) ? -1 : 0));
      setData(expenses);
      setTableData(expenses);
    });
  }, []);

  const handleSelect = (tabIndex: number) => {
    if (tabIndex === 0) {
      setTableData(data);
    } else {
      // Calculate amount based on department
      reCalculate('department');
    }
  }

  const reCalculate = (key: string) => {
    setTableData([]);
    const result: any[] = [];
    data.reduce(function (res: any, expense: Expense) {
      type ObjectKey = keyof typeof expense;
      const valKey = key as ObjectKey;
      if (!res[expense[valKey]]) {
        res[expense[valKey]] = {
          [key]: expense[valKey],
          amount: Number(expense.amount)
        };
        result.push(res[expense[valKey]]);
      } else {
        res[expense[valKey]].amount += Number(expense.amount);
      }
      return res;
    }, {});
    setTableData(result);
  }

  return (
    <Container>
      <Tabs
        onSelect={handleSelect}>
        <TabList>
          <Tab>Expenses List</Tab>
          <Tab>Reports</Tab>
        </TabList>

        <TabPanel>
          <Table data={tableData} />
        </TabPanel>
        <TabPanel>
          <DropDownContainer>
            <span>Total Expenses By:</span>
            <select onChange={(e: React.FormEvent<HTMLSelectElement>) => reCalculate(e.currentTarget.value)}>
              <option value="department">Departments</option>
              <option value="project">Project Name</option>
              <option value="date">Date</option>
              <option value="member">Name</option>
            </select>
          </DropDownContainer>
          {tableData.length > 0 && <Table data={tableData} />}
        </TabPanel>
      </Tabs>
    </Container>
  );
}

export default App;
