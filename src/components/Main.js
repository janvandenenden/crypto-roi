import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faYenSign,
  faEuroSign,
  faPoundSign,
} from "@fortawesome/free-solid-svg-icons";

import api from "../api";

import "../scss/custom.scss";

//create start dates for investment
const createInvestmentStartDates = () => {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  let twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(year - 2);
  let oneYearAgo = new Date();
  oneYearAgo.setFullYear(year - 1);
  let oneMonthAgo = new Date();
  oneMonthAgo.setMonth(month - 1);
  let threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(month - 3);
  let sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(month - 6);

  return {
    oneMonthAgo: oneMonthAgo.toLocaleString().substr(0, 10),
    threeMonthsAgo: threeMonthsAgo.toLocaleString().substr(0, 10),
    sixMonthsAgo: sixMonthsAgo.toLocaleString().substr(0, 10),
    oneYearAgo: oneYearAgo.toLocaleString().substr(0, 10),
    twoYearsAgo: twoYearsAgo.toLocaleString().substr(0, 10),
  };
};

function MainMessage() {
  const [currency, setCurrency] = useState("usd");
  const [cryptoCurrency, setCryptoCurrency] = useState("ethereum");
  const [investment, setInvestment] = useState(100);
  const [investmentStartDate, setInvestmentStartDate] = useState(
    () => createInvestmentStartDates().twoYearsAgo
  );
  const [historicPrice, setHistoricPrice] = useState({});
  const [currentPrice, setCurrentPrice] = useState({});
  const [change, setChange] = useState(0);

  const parseDate = (input, format) => {
    format = format || "yyyy-mm-dd"; // default format
    var parts = input.match(/(\d+)/g),
      i = 0,
      fmt = {};
    // extract date-part indexes from the format
    format.replace(/(yyyy|dd|mm)/g, function (part) {
      fmt[part] = i++;
    });
    return new Date(parts[fmt["yyyy"]], parts[fmt["mm"]] - 1, parts[fmt["dd"]]);
  };

  const currencies = [
    {
      id: "usd",
      icon: faDollarSign,
    },
    {
      id: "eur",
      icon: faEuroSign,
    },
    {
      id: "gbp",
      icon: faPoundSign,
    },
    {
      id: "jpy",
      icon: faYenSign,
    },
  ];
  const cryptoCurrencies = [
    {
      id: "bitcoin",
      ticker: "btc",
    },
    {
      id: "ethereum",
      ticker: "eth",
    },
    {
      id: "litecoin",
      ticker: "ltc",
    },
    {
      id: "chainlink",
      ticker: "link",
    },
    {
      id: "cardano",
      ticker: "ada",
    },
    {
      id: "dogecoin",
      ticker: "doge",
    },
  ];

  useEffect(() => {
    async function getHistoricPrice(cryptoCurrency, investmentStartDate) {
      let convertedInvestmentStartDate = new Date(
        parseDate(investmentStartDate?.toLocaleString(), "dd-mm-yyyy")
      );
      let day = ("0" + convertedInvestmentStartDate.getDate()).slice(-2);
      let month = ("0" + (convertedInvestmentStartDate.getMonth() + 1)).slice(
        -2
      );
      let year = convertedInvestmentStartDate.getFullYear();
      const date = `${day}-${month}-${year}`;
      try {
        const response = await api.get(
          `https://api.coingecko.com/api/v3/coins/${cryptoCurrency}/history?date=${date}&localization=false`
        );
        setHistoricPrice({
          eur: response?.data.market_data?.current_price["eur"],
          gbp: response?.data.market_data?.current_price["gbp"],
          usd: response?.data.market_data?.current_price["usd"],
          jpy: response?.data.market_data?.current_price["jpy"],
        });
      } catch (error) {
        console.error(error);
      }
    }
    getHistoricPrice(cryptoCurrency, investmentStartDate);
  }, [cryptoCurrency, investmentStartDate]);

  useEffect(() => {
    async function getCurrentPrice(cryptoCurrency) {
      try {
        const response = await api.get(
          `https://api.coingecko.com/api/v3/coins/${cryptoCurrency}`
        );
        setCurrentPrice({
          eur: response.data.market_data.current_price["eur"],
          gbp: response.data.market_data.current_price["gbp"],
          usd: response.data.market_data.current_price["usd"],
          jpy: response.data.market_data.current_price["jpy"],
        });
      } catch (error) {
        console.error(error);
      }
    }
    getCurrentPrice(cryptoCurrency);
  }, [cryptoCurrency]);

  useEffect(() => {
    const calculateChange = (
      investment,
      currentPrice,
      historicPrice,
      currency
    ) => {
      let change = (
        (investment / historicPrice[currency]) *
        currentPrice[currency]
      ).toFixed(0);
      if (isNaN(change)) change = "calculating";
      setChange(change);
    };
    calculateChange(investment, currentPrice, historicPrice, currency);
  }, [currentPrice, historicPrice, investment, currency]);

  const currencyIcon = currencies.find((obj) => {
    return obj.id === currency;
  });

  const handleInvestmentStartChange = (e) => {
    setInvestmentStartDate(createInvestmentStartDates()[e.target.value]);
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between">
      <div className="navbar container-fluid bg-white">
        <div className="row">
          <div
            className="d-flex cryptoCurrenciesContainer btn-group col-lg-8"
            role="group"
            aria-label="cryptocurrencies"
          >
            {cryptoCurrencies.map((crypto) => (
              <button
                type="button"
                className={`btn cryptoCurrencies d-flex justify-content-center ${
                  cryptoCurrency === crypto.id ? "active" : ""
                }`}
                data-bs-toggle="button"
                aria-pressed="true"
                aria-current="true"
                autoComplete="off"
                id={crypto.id}
                key={crypto.id}
                onClick={(e) => {
                  setCryptoCurrency(e.currentTarget.id);
                }}
              >
                <img src={`../img/${crypto.id}.png`} alt={crypto.id} />
                <span className="ml-2 small font-weight-bold d-none d-lg-block text-uppercase">
                  {crypto.ticker}
                </span>
              </button>
            ))}
          </div>
          <div
            id="investmentRange"
            className="col-lg-4 pt-3 pt-lg-0 d-flex align-items-center"
          >
            <label
              htmlFor="investment"
              className="form-label d-flex align-items-center mb-0 mr-1"
            >
              <FontAwesomeIcon size="sm" icon={currencyIcon.icon} />
              {investment}
            </label>
            <input
              type="range"
              className="form-range"
              min="100"
              max="10000"
              step="25"
              id="investment"
              onChange={(e) => {
                setInvestment(e.currentTarget.value);
              }}
            ></input>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column bg-white">
        <div className="my-auto container-fluid">
          <h1 className="display-3">
            If you invested
            <br />
            <FontAwesomeIcon icon={currencyIcon.icon} color="#011627" />{" "}
            <span className="dynamic text-dark investment">{investment}</span>{" "}
            in{" "}
            <span className="dynamic cryptoCurrency text-capitalize">
              {cryptoCurrency}
            </span>
            <br />
            on{" "}
            <span className="dynamic investmentStartDate">
              {investmentStartDate}
            </span>
            ,<br /> it would be worth
            <br />
            <FontAwesomeIcon icon={currencyIcon.icon} color="#011627" />{" "}
            <span className="dynamic">{change}</span> today!
          </h1>
        </div>
      </div>
      <div className="navbar d-flex flex-column flex-lg-row container-fluid bg-white">
        <div
          className="d-flex currenciesContainer justify-content-around justify-content-lg-start"
          role="group"
          aria-label="cryptocurrencies"
        >
          {currencies.map((currencyCoin) => (
            <button
              type="button"
              className={`btn currencyButton rounded-circle ml-2 ${
                currency === currencyCoin.id ? "active" : ""
              }`}
              data-bs-toggle="button"
              autoComplete="off"
              id={currencyCoin.id}
              key={currencyCoin.id}
              onClick={(e) => {
                setCurrency(e.currentTarget.id);
              }}
            >
              <FontAwesomeIcon icon={currencyCoin.icon} />
            </button>
          ))}
        </div>
        <div>
          <select
            className="form-select form-select-lg border-0 font-weight-bold investmentStartDate"
            aria-label="Set start date of investment"
            onChange={(e) => handleInvestmentStartChange(e)}
          >
            <option value="twoYearsAgo">2 years ago</option>
            <option value="oneYearAgo">1 year ago</option>
            <option value="sixMonthsAgo">6 months ago</option>
            <option value="threeMonthsAgo">3 months ago</option>
            <option value="oneMonthAgo">1 month ago</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default MainMessage;
