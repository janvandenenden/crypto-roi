import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faYenSign,
  faEuroSign,
  faPoundSign,
} from "@fortawesome/free-solid-svg-icons";

import { Textfit } from "react-textfit";

import api from "../api";

import "../scss/custom.scss";

function MainMessage() {
  const [currency, setCurrency] = useState("usd");
  const [cryptoCurrency, setCryptoCurrency] = useState("ethereum");
  const [investment, setInvestment] = useState(100);
  const [investmentStartDate, setInvestmentStartDate] = useState("23-06-2020");
  const [investmentStartDates, setInvestmentStartDates] = useState();
  const [date, setDate] = useState();
  const [historicPrice, setHistoricPrice] = useState({});
  const [currentPrice, setCurrentPrice] = useState({});
  const [change, setChange] = useState(0);

  async function getCurrentPrice(cryptoCurrency) {
    try {
      const response = await api.get(
        `https://api.coingecko.com/api/v3/coins/${cryptoCurrency}`
      );
      const mainCurrencies = {
        eur: response.data.market_data.current_price["eur"],
        gbp: response.data.market_data.current_price["gbp"],
        usd: response.data.market_data.current_price["usd"],
        jpy: response.data.market_data.current_price["jpy"],
      };
      setCurrentPrice(mainCurrencies);
    } catch (error) {
      console.error(error);
    }
  }

  async function getHistoricPrice(cryptoCurrency, investmentStartDate) {
    let date = "";
    if (investmentStartDate !== undefined) {
      let convertedInvestmentStartDate = new Date(
        parseDate(investmentStartDate.toLocaleString(), "dd-mm-yyyy")
      );
      let day = ("0" + convertedInvestmentStartDate.getDate()).slice(-2);
      let month = ("0" + (convertedInvestmentStartDate.getMonth() + 1)).slice(
        -2
      );
      let year = convertedInvestmentStartDate.getFullYear();
      date = `${day}-${month}-${year}`;
    } else {
      date = `23-06-2020`;
    }
    try {
      const response = await api.get(
        `https://api.coingecko.com/api/v3/coins/${cryptoCurrency}/history?date=${date}&localization=false`
      );

      const mainCurrencies = {
        eur: response?.data.market_data?.current_price["eur"],
        gbp: response?.data.market_data?.current_price["gbp"],
        usd: response?.data.market_data?.current_price["usd"],
        jpy: response?.data.market_data?.current_price["jpy"],
      };
      setHistoricPrice(mainCurrencies);
    } catch (error) {
      console.error(error);
    }
  }

  function parseDate(input, format) {
    format = format || "yyyy-mm-dd"; // default format
    var parts = input.match(/(\d+)/g),
      i = 0,
      fmt = {};
    // extract date-part indexes from the format
    format.replace(/(yyyy|dd|mm)/g, function (part) {
      fmt[part] = i++;
    });

    return new Date(parts[fmt["yyyy"]], parts[fmt["mm"]] - 1, parts[fmt["dd"]]);
  }

  const calculateChange = () => {
    const change = (
      investment *
      (currentPrice[currency] / historicPrice[currency])
    ).toFixed(2);
    setChange(change);
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
  ];

  const createInvestmentStartDates = () => {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let twoYearsAgo = new Date();
    let oneYearAgo = new Date();
    let oneMonthAgo = new Date();
    let threeMonthsAgo = new Date();
    let sixMonthsAgo = new Date();
    oneMonthAgo.setMonth(month - 1);
    threeMonthsAgo.setMonth(month - 3);
    sixMonthsAgo.setMonth(month - 6);
    oneYearAgo.setFullYear(year - 1);
    twoYearsAgo.setFullYear(year - 2);
    setDate(today.toLocaleString().substr(0, 10));
    setInvestmentStartDates({
      oneMonthAgo: oneMonthAgo.toLocaleString().substr(0, 10),
      threeMonthsAgo: threeMonthsAgo.toLocaleString().substr(0, 10),
      sixMonthsAgo: sixMonthsAgo.toLocaleString().substr(0, 10),
      oneYearAgo: oneYearAgo.toLocaleString().substr(0, 10),
      twoYearsAgo: twoYearsAgo.toLocaleString().substr(0, 10),
    });
  };

  useEffect(() => {
    createInvestmentStartDates();
  }, []);

  useEffect(() => {
    setInvestmentStartDate(investmentStartDates?.twoYearsAgo);
  }, [investmentStartDates]);

  useEffect(() => {
    getCurrentPrice(cryptoCurrency);
    getHistoricPrice(cryptoCurrency, investmentStartDate);
  }, [cryptoCurrency, investmentStartDate, currency]);

  useEffect(() => {
    calculateChange(investment, currency);
  }, [currentPrice, historicPrice, investment]);

  const currencyIcon = currencies.find((obj) => {
    return obj.id === currency;
  });

  const handleInvestmentStartChange = (e) => {
    setInvestmentStartDate(investmentStartDates[e.target.value]);
  };

  return (
    <>
      <div className="navbar fixed-top container bg-white">
        <div className="row">
          <div
            className="d-flex cryptoCurrenciesContainer col-lg-6"
            role="group"
            aria-label="cryptocurrencies"
          >
            {cryptoCurrencies.map((cryptoCurrency) => (
              <button
                type="button"
                className="btn btn-white cryptoCurrencies d-flex"
                data-bs-toggle="button"
                aria-pressed={true}
                aria-current="true"
                autoComplete="off"
                id={cryptoCurrency.id}
                key={cryptoCurrency.id}
                onClick={(e) => {
                  setCryptoCurrency(e.currentTarget.id);
                }}
              >
                <img
                  src={`../img/${cryptoCurrency.id}.png`}
                  alt={cryptoCurrency.id}
                />
                <span className="ml-2 small font-weight-bold d-none d-lg-block">
                  {cryptoCurrency.ticker}
                </span>
              </button>
            ))}
          </div>
          <div
            id="investmentRange"
            className="col-lg-6 pt-3 pt-md-0 d-flex align-items-center"
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
              id="investment"
              onChange={(e) => {
                setInvestment(e.currentTarget.value);
              }}
            ></input>
          </div>
        </div>
      </div>
      <div
        className="d-flex flex-column bg-white"
        style={{ minHeight: "calc(100vh - 116px)", marginTop: "62px" }}
      >
        <div className="my-auto container text-left">
          <h1>
            <Textfit mode="single">
              <FontAwesomeIcon size="sm" icon={currencyIcon.icon} />{" "}
              {investment}
              <span className="text-muted"> of </span> {cryptoCurrency}
            </Textfit>
            <Textfit mode="single">
              <span className="text-muted">bought on</span>{" "}
              {investmentStartDate}
              <span className="text-muted">,</span>
            </Textfit>
            <Textfit mode="single">
              <span className="text-muted">would be worth</span>
            </Textfit>
            <Textfit mode="single">
              <FontAwesomeIcon size="sm" icon={currencyIcon.icon} /> {change}{" "}
              <span className="text-muted">today!</span>
            </Textfit>
          </h1>
        </div>
      </div>
      <div className="navbar fixed-bottom container bg-white">
        <div
          className="d-flex currenciesContainer col-sm-6"
          role="group"
          aria-label="cryptocurrencies"
        >
          {currencies.map((currency) => (
            <button
              type="button"
              className="btn btn-outline-dark rounded-circle ml-2 currency"
              data-bs-toggle="button"
              autoComplete="off"
              id={currency.id}
              key={currency.id}
              onClick={(e) => {
                setCurrency(e.currentTarget.id);
              }}
            >
              <FontAwesomeIcon icon={currency.icon} />
            </button>
          ))}
        </div>
        <div>
          <select
            className="form-select border-0 bg-white"
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
    </>
  );
}

export default MainMessage;
