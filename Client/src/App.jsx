import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement
);

function App() {
  const [stats, setStats] = useState({});
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [chartstats, setChartstats] = useState([]);
  const [combineData, setCombineData] = useState({});
  const [monthName, setMonthName] = useState("March");
  const [transactions, setTransactions] = useState([]);
  const visibleTransactionsCount = 10;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // filterTransactionsByMonth(monthName);
    // getStatisticsForMonth(monthName);
    // getChartStats(monthName);
    // getPieChartStats(monthName);
    getCombineData(monthName, page, perPage);
  }, [monthName, page, perPage]);

  const validMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function getCombineData(monthName, page, perPage) {
    axios
      .get(
        `/api/combined?monthName=${monthName}&page=${page}&perPage=${perPage}`
      )
      .then((response) => {
        const data = response.data;
        setCombineData(data);
        setStats(data.statistics);
        setChartstats(data.chartstats);
        setTransactions(data.transactions);
        const updatedLabels = data.piechartstats.map((entry) => entry.category);
        const updatedValues = data.piechartstats.map((entry) => entry.count);
        setLabels(updatedLabels);
        setValues(updatedValues);
      })
      .catch((error) => {
        console.error("\nFrontend Error in CombineData: ", error);
      });
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setMonthName(option);
    getCombineData(option);
    setIsOpen(false);
  };

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= transactions.length / visibleTransactionsCount &&
      selectedPage !== page
    ) {
      setPage(selectedPage);
    }
  };

  const data = {
    labels: chartstats.map((item) => item.range),
    datasets: [
      {
        label: `Bar Chart Stats - ${monthName}`,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        data: chartstats.map((item) => item.count),
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const tableHeaders = [
    "ID",
    "Title",
    "Description",
    "Price",
    "Category",
    "Sold",
    "Image",
  ];

  const pieChartDataJson = {
    labels: labels,
    datasets: [
      {
        label: "Items Count",
        data: values,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <div className="text-gray-100 bg-slate-800 h-full p-5 flex flex-col items-center">
        <h1 className="text-center text-2xl font-semibold p-5 py-4 border rounded-full mt-5 mb-10 ">
          <span>
            {monthName} Transactions{" -> "}
          </span>
          <span>Count : {transactions.length}</span>
        </h1>
        <div className="flex gap-10">
          <div>
            <input
              type="text"
              id="searchTransactions"
              name="searchTransactions"
              placeholder="Search Transactions..."
              onChange={(e) => setQuery(e.target.value)}
              className="outline-none bg-gray-200 px-4 py-2 rounded-2xl text-slate-800 w-64"
            />
          </div>
          <div className="w-80 dropdown outline-none bg-gray-200 px-4 py-2 rounded-2xl text-slate-800 w-64">
            <button
              className="dropdown-toggle cursor-pointer w-full "
              onClick={handleToggle}
            >
              {monthName ? monthName : "Select an option"}
            </button>
            {isOpen && (
              <div className="dropdown-menu text-center grid grid-cols-3 ">
                {validMonths.map((option) => (
                  <p
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="cursor-pointer hover:bg-gray-300 p-2 rounded-full"
                  >
                    {option}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <h1 className="my-5 mt-10 px-5 py-2 text-center text-2xl border rounded-full">
          <span>Transactions Dashboard</span>
        </h1>
        <div>
          <div className="flex justify-between my-3 px-10 text-slate-800">
            <div className="bg-gray-200 py-2 px-5 rounded-3xl">
              Page No. {page}
            </div>
            <div>
              <button
                className={`bg-gray-200 py-2 px-5 rounded-3xl hover:bg-gray-200/[0.87] active:scale-[0.97] ${
                  page < transactions.length / visibleTransactionsCount
                    ? ""
                    : "cursor-not-allowed opacity-50 active:scale-[1]"
                }  `}
                onClick={() => selectPageHandler(page - 1)}
              >
                Previous
              </button>
              <span className="text-gray-200 font-extrabold text-xl">
                {" - "}
              </span>
              <button
                onClick={() => selectPageHandler(page + 1)}
                className={`bg-gray-200 py-2 px-5 rounded-3xl hover:bg-gray-200/[0.87] active:scale-[0.97] ${
                  page < transactions.length / visibleTransactionsCount
                    ? ""
                    : "cursor-not-allowed opacity-50 active:scale-[1]"
                } `}
              >
                Next
              </button>
            </div>
            <div className="bg-gray-200 py-2 px-5 rounded-3xl">
              PerPage : {perPage}
            </div>
          </div>
          <table
            border="2"
            className="rounded-3xl w-full border-collapse border-spacing-6 text-justify bg-orange-300 text-slate-800"
          >
            <thead>
              <tr className="w-full">
                {tableHeaders.map((transaction) => {
                  return (
                    <th
                      className={` border border-2 p-3 border-slate-800 rounded-full`}
                      key={transaction}
                    >
                      {transaction}
                    </th>
                  );
                })}
              </tr>
            </thead>
            {transactions.length > 0 && (
              <tbody>
                {transactions
                  .slice(
                    page * visibleTransactionsCount - visibleTransactionsCount,
                    page * visibleTransactionsCount
                  )
                  .filter((item) => {
                    return query.toLowerCase() === ""
                      ? item
                      : item.title.toLowerCase().includes(query) ||
                          item.description.toLowerCase().includes(query) ||
                          item.price.toString().includes(query);
                  })
                  .map((transaction) => {
                    return (
                      <tr key={transaction.id}>
                        <td className=" p-4 border border-slate-800 border-2">
                          {transaction.id}
                        </td>
                        <td className=" p-4 border border-slate-800 border-2">
                          {transaction.title}
                        </td>
                        <td className=" p-4 border border-slate-800 border-2">
                          {transaction.description}
                        </td>
                        <td className=" p-4 border border-slate-800 border-2">
                          {transaction.price}
                        </td>
                        <td className=" p-4 border border-slate-800 border-2">
                          {transaction.category}
                        </td>
                        <td className=" p-4 border border-slate-800 border-2">
                          {transaction.sold ? "Out of Stock" : "In Stock"}
                        </td>
                        <td className=" p-4 border border-slate-800 border-2">
                          <img
                            src={transaction.image}
                            className="h-20 rounded-2xl object-contain"
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            )}
          </table>
        </div>
        <div className=" h-fit mt-10 bg-orange-300 p-5 text-slate-800 rounded-3xl">
          <h1 className="font-bold mb-4 text-3xl">Statistics - {monthName}</h1>
          <div className="flex gap-5 text-lg ">
            <div>
              <p className="font-medium">Total Sale:</p>
              <p className="font-medium">Total sold items:</p>
              <p className="font-medium">Total not sold item:</p>
            </div>
            <div>
              <p>{stats.monthlySale}</p>
              <p>{stats.monthlySaleUnits}</p>
              <p>{stats.monthlyNotSoldUnits}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-20 my-10 w-3/4 item-center justify-center">
          <div className="p-3 bg-gray-100 flex items-center justify-center w-2/4 rounded-3xl">
            <Bar data={data} options={options} />
          </div>
          <div>
            <Pie data={pieChartDataJson} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
