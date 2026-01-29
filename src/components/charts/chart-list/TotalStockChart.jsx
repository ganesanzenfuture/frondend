import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { getBrandWiseReport } from "../../../services/customerBilling.service";

const TotalStockColumnChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await getBrandWiseReport();
        setChartData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Brand report load failed", err);
        setChartData([]); // 🔒 NEVER undefined
      }
    };

    loadBrands();
  }, []);

  const hasData = Array.isArray(chartData) && chartData.length > 0;

  const categories = hasData
    ? chartData.map((b) => b.brand ?? "Unknown")
    : ["No Sales"];

  const series = [
    {
      name: "Stock",
      data: hasData
        ? chartData.map((b) => Number(b.qty) || 0)
        : [0],
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 6,
      },
    },
    colors: hasData ? ["rgba(143, 12, 0, 1)"] : ["#e0e0e0"],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { rotate: -45 },
    },
    yaxis: {
      title: { text: "Selling Quantity" },
    },
    tooltip: {
      enabled: hasData,
      y: {
        formatter: (val) => `${val} qty`,
      },
    },
  };

  return (
    <div>
      <h5>Highest Selling Brands</h5>

      {/* 🔒 EXTRA SAFETY */}
      {Array.isArray(series[0].data) && (
        <Chart
          options={options}
          series={series}
          type="bar"
          height={320}
        />
      )}
    </div>
  );
};

export default TotalStockColumnChart;
