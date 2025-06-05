import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";

interface TempChartProps {
  tempData: [number, number][];
  oilData: [number, number][];
  rpmData: [number, number][];
}

const TempChart: React.FC<TempChartProps> = ({ tempData, oilData, rpmData }) => {
  const options: Highcharts.Options = {
    chart: {
      type: "spline",
      animation: true,
      height: 400,
      width: 760
    },
    title: {
      text: "Temperatur- & RPM-Verläufe",
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Zeit",
      },
    },
    yAxis: [
      {
        title: { text: "Temperatur (°C)" },
        min: 0,
        max: 120,
      },
      {
        title: { text: "RPM" },
        min: 0,
        max: 5000,
        opposite: true, // rpm scale on the right side
      },
    ],
    series: [
      {
        name: "Temperatur",
        type: "spline",
        data: tempData,
        color: "#3498db",
        yAxis: 0,
      },
      {
        name: "Öltemperatur",
        type: "spline",
        data: oilData,
        color: "#00008B",
        yAxis: 0,
      },
      {
        name: "Drehzahl (RPM)",
        type: "spline",
        data: rpmData,
        color: "#ff0000",
        yAxis: 1,
      }
    ],
    tooltip: {
      xDateFormat: "%H:%M:%S", // datum zeigt richtig
      shared: true, // um alle elemente gleichzeitig zeigen
    },
    credits: { enabled: false }, // damit keine beschreibung wird sogennante: Highcharts.com
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default TempChart;
