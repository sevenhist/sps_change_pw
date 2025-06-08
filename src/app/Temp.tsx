import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";

interface TempChartProps {
  tempData: [number, number][];
  oilData: [number, number][];
  rpmData: [number, number][];
}

const TempChart: React.FC<TempChartProps> = ({ tempData, oilData, rpmData }) => {
  Highcharts.setOptions({
    time: {
      timezone: 'Europe/Vienna'
    }
  });

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
        labels: { // subscribing on y axis
          formatter: function () {
            return Math.round(this.value as number).toString();
          }
        }
      },
      {
        title: { text: "RPM" },
        min: 0,
        max: 5000,
        opposite: true, // rpm scale on the right side
        labels: { // subscribing on y axis
          formatter: function () {
            return Math.round(this.value as number).toString();
          }
        }
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
      formatter: function () {
        let s = `<b>${Highcharts.dateFormat('%H:%M:%S', this.x)}</b><br/>`; // fürs datum
        this.points?.forEach(point => { // points ist ein Array von Punkten 
          s += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${Math.round(point.y as number)}</b><br/>`;
        });
        return s;
      }
    },
    credits: { enabled: false }, // damit keine beschreibung wird sogennante: Highcharts.com
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default TempChart;
