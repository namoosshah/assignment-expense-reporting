import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Expense } from "../../interfaces/Expense";

const StyledTable = styled.table`
  width: 100%;
  border: none;
  border-collapse: collapse;
  font-family: arial, sans-serif;

  thead {
    th {
      background-color: #efefef;
      font-weight: 600;
      text-align: left;
      font-size: 0.875rem;
      text-transform: uppercase;
      padding: 0.5rem;
      color: #202020;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
    }
  }
  tbody {
    tr {
      td {
        text-align: left;
        font-size: 1rem;
        padding: 0.5rem;
        border-bottom: 1px solid #e0e0e0;
      }
    }
  }
`;

export const Table = (props: {
  data: Expense[]
}) => {
  if (props.data.length === 0) {
    return null;
  }
  return (<TableMarkup titles={Object.keys(props.data[0])} data={props.data} />);
}
const TableMarkup = ({ titles, data }: any) => {
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [columns, setColumns] = useState(data);
  
  useEffect(() => {
    setColumns(data);
    setSortKey(Object.keys(data[0])[0]); // default sort for selected listing
  }, [data]);

  const total = columns.reduce((accumulator: number, current: Expense) => accumulator + current.amount, 0);
  // Format currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  });

  const sort = () => {
    const data = JSON.parse(JSON.stringify(columns));
    data.sort((a: Expense, b: Expense) => {
      type ObjectKey = keyof typeof a;
      const valKey = sortKey as ObjectKey;
      return sortOrder === 'asc' ? (a[valKey] > b[valKey]) ? 1 : ((b[valKey] > a[valKey]) ? -1 : 0)
        : (b[valKey] > a[valKey]) ? 1 : ((a[valKey] > b[valKey]) ? -1 : 0);
    });
    setColumns(data);
  }

  const updateSort = (key: string) => {
    setSortOrder(key === sortKey ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortKey(key);
  }

  useEffect(() => {
    if (sortKey) {
      sort();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey, sortOrder]);

  return (
    <StyledTable>
      <thead>
        <tr>
          {titles.map((title: string, index: number) => (
            <th key={index} onClick={() => updateSort(title)}>{title.replace(/_/g, ' ')}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {columns.map((item: string[], index: number) => (
          <tr key={index}>
            {titles.map((title: any, index: number) => (
              <td key={index}>
                {title === 'amount' ? formatter.format(Number(item[title])) : item[title]}
              </td>
            ))}
          </tr>
        ))}
        {titles.length === 2 && <tr>
          <td style={{textAlign: 'right'}}>Total</td>
          <td>{formatter.format(total)}</td>
        </tr>}
      </tbody>
    </StyledTable>
  );
}
