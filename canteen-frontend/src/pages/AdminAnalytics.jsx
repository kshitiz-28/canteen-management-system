// src/components/AdminAnalytics.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../store/slices/transactionSlice";

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.transactions);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTransactions());
    }
  }, [status, dispatch]);

  if (status === "loading") return <p>Loading transactions...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Admin Analytics</h1>
      {items.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.employeeName}</td>
                <td>{t.amount}</td>
                <td>{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAnalytics;
