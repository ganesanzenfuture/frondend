import "./invoice.css";
import logo1 from "../../assets/images/logo-1.png";
import logo2 from "../../assets/images/logo-2.png";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCustomerBillingById } from "../../services/customerBilling.service";

export const Invoice = () => {
  const { id } = useParams();

  const [billing, setBilling] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
   getCustomerBillingById(id).then((res) => {
  setBilling(res.billing);
  setProducts(res.products);
});
  }, [id]);
   useEffect(() => {
  if (billing) {
    setTimeout(() => window.print(), 500);
  }
}, [billing]);

  if (!billing) return <p>Loading invoice...</p>;

  return (
    <div className="invoice-box">
      <div style={{ border: "2px solid #000" }}>
        <div className="header">
          <div className="header-top">
            <span className="copy-type">Original / Duplicate / Accounts Copy</span>
          </div>

          <div className="header-bottom">
            <div className="left">
              <img src={logo1} alt="" />
            </div>

            <div className="center">
              <div className="center-top">
                <h1>
                  DHEERAN TRADERS <sup>TM</sup>
                </h1>
              </div>

              <div className="center-bottom">
                <p>
                  Registered: 5/218/1, Pennagaram Main Road, Sogathur, <br />
                  Dharmapuri, Tamil Nadu, 636809
                </p>
              </div>
            </div>

            <div className="right">
              <img src={logo2} alt="" />
            </div>
          </div>

          <div className="quote-box">
            <p>"மனிதனை மனிதனாக மதிப்போம்"! "வேற்றுமையில் ஒற்றுமை காண்போம்"!!</p>
            <p className="big">செய்வது துணிந்து செய்</p>
          </div>
        </div>

        <div className="info-section">
          <div className="contact-info">
            <div className="padd">
              <p>
                <strong>Email:</strong> dheerantradersthennarasu@gmail.com
              </p>
              <p>
                <strong>Website:</strong> www.dheerantrades.com
              </p>
             <p>
                <strong>GSTIN:</strong> {billing.gst_number || "-"}
              </p>

            </div>
          </div>

          <div className="invoice-details">
            <div className="padd-1">
              <p>
               <strong>INVOICE:</strong>{" "}
                <span style={{ color: "#a52a2a" }}>
                  {billing.invoice_number}
                </span>
              </p>
                    <div className="date-info">
                    {new Date(billing.invoice_date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

              <p>TN29CD5389</p>
            </div>
          </div>
        </div>

        <div className="customer-section">
          <div className="customer-section-top">
            <p>CUSTOMER ADDRESS</p>
          </div>

          <div style={{ display: "flex" }}>
            <div className="customer-address" style={{ width: "70%" }}>
              <p>{billing.customer_name}</p>
              <p>
                <strong>Phone:</strong> {billing.phone_number}
              </p>
            </div>
            <div className="customer-address" style={{ width: "30%" }}>
              {/* <p>
               <p>
                <strong>GSTIN:</strong> {billing.gst_number || "-"}
              </p>

              </p> */}
              <p>
                <strong>Staff Name:</strong>{" "}
                <span style={{ color: "#a52a2a" }}>
                  {billing.staff_name}
                </span>
              </p>
              <p>
                <strong>Staff Phone:</strong>{" "}
                {billing.staff_phone}
              </p>

            </div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th width="7%">SI No</th>
              <th width="42%">DESCRIPTION</th>
              <th width="10%">HSN</th>
              <th width="10%">QTY</th>
              <th width="15%">RATE</th>
              <th width="15%">AMOUNT</th>
            </tr>
          </thead>

          <tbody>
  {products.map((p, i) => (
    <tr key={i}>
      <td>{i + 1}</td>
      <td className="text-left">{p.product_name}</td>
      <td>{p.hsn || "-"}</td>
      <td>{p.quantity}</td>
      <td>{p.rate}</td>
      <td>{p.total}</td>
    </tr>
  ))}
</tbody>


          <tbody className="footer-body">
                  <tr>
                    <td colSpan="4"></td>
                    <td>Subtotal</td>
                    <td>₹{billing.subtotal}</td>
                  </tr>


            <tr>
              <td colSpan="4">
                <h5 style={{ fontSize: "20px", margin: 0 }}>Disclaimer</h5>
                <p style={{ fontWeight: 400, margin: "3px 0" }}>
                  Goods sold under this invoice are unregistered brand names & supply under GST chargeable to 0% tax.
                </p>
              </td>
              <td>
                  GST ({billing.tax_gst_percent}%)
                </td>
                <td>{billing.tax_gst_amount}</td>

            </tr>

            <tr>
              <td
                colSpan="4"
                style={{
                  textAlign: "right",
                  color: "#a52a2a",
                }}>
                #48 மணி நேரத்திற்கு பிறகு திரும்பபெற இயலாது*
              </td>
              <td style={{ fontSize: "16px" }}>Total</td>
              <td className="grand-total">
               ₹{parseFloat(billing.grand_total || 0).toFixed(2)}
              </td>

            </tr>
                 <tr>
                    <td colSpan="4"></td>
                    <td>Advance Paid</td>
                    <td>₹{billing.advance_paid}</td>
                  </tr>

                  <tr>
                    <td colSpan="4"></td>
                    <td>Cash</td>
                    <td>₹{billing.cash_amount}</td>
                  </tr>

                  <tr>
                    <td colSpan="4"></td>
                    <td>UPI</td>
                    <td>₹{billing.upi_amount}</td>
                  </tr>

                  <tr>
                    <td colSpan="4"></td>
                    <td>Balance Due</td>
                    <td>₹{billing.balance_due}</td>
                  </tr>

            <tr>
              <td colSpan="4">
            <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ margin: "0px 30px" }}>
                      {billing.qr_code_image && (
                        <img
                          src={`http://localhost:5000${billing.qr_code_image}`}
                          style={{ width: "80px" }}
                          alt="Bank QR"
                        />
                      )}
                    </div>

                    <div className="bank-details">
                      <strong>OUR BANK DETAILS:</strong>
                      <br />
                      BANK NAME: {billing.bank_name}
                      <br />
                      ACCOUNT NAME: {billing.account_name}
                      <br />
                      A/C: {billing.account_number}
                      <br />
                      IFSC CODE: {billing.ifsc_code} | BRANCH: {billing.branch}
                    </div>
                  </div>

              </td>

              <td colSpan="2">
                <div className="signature">
                  <h6 style={{ margin: "2px 0", fontSize: "16px" }}>For DHEERAN TRADER</h6>
                  <p style={{ margin: "2px 0" }}>Proprietor</p>
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan="6">
                <div className="disclaimer">
                  <span>For Reg :</span>
                  Mathikonpalayam, Tirupattur Road, Dharmapuri, Tamil Nadu-636 701
                  <br />
                  If you have any questions about this invoice,
                  <br />
                  Please contact Phone No. +91 9865065260 & Email ID: dheerantradersthennarasu@gmail.com
                  <br />
                  <strong>Thank You For Your Business!</strong>
                  <br />
                  "the system generated signature not required"
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
