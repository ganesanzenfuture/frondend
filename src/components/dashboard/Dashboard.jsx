import { Chart } from "../charts/Chart";
import { StackCard } from "../stackcards/StackCard";
import "./dashboard.css";
import "../../assets/css/style.css";
import { CustomerTable } from "../tables/CustomerTable";

export const Dashboard = () => {
  return (
    <>

      <StackCard />
      <Chart />
      <CustomerTable />
    </>
  );
};
