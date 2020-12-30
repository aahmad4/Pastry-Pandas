import React, { useState, useEffect } from "react";
import {
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Divider,
  Button,
  CssBaseline,
} from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";

import { commerce } from "../../../lib/commerce";

import useStyles from "./styles";
import AddressForm from "../AddressForm";
import PaymentForm from "../PaymentForm";

const steps = ["Shipping address", "Payment details"];

export default function Checkout({
  cart,
  order,
  handleCaptureCheckout,
  errorMessage,
}) {
  const classes = useStyles();
  const history = useHistory();

  const [activeStep, setActiveStep] = useState(0);
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [shippingData, setShippingData] = useState({});

  useEffect(() => {
    const generateToken = async () => {
      try {
        const token = await commerce.checkout.generateToken(cart.id, {
          type: "cart",
        });

        setCheckoutToken(token);
      } catch (e) {
        history.push("/");
      }
    };

    generateToken();
  }, [cart]);

  const nextStep = () =>
    setActiveStep((previousActiveStep) => previousActiveStep + 1);

  const backStep = () =>
    setActiveStep((previousActiveStep) => previousActiveStep - 1);

  const next = (data) => {
    setShippingData(data);

    nextStep();
  };

  const Confirmation = () =>
    order.customer ? (
      <React.Fragment>
        <div>
          <Typography variant="h5">
            Thank you for your purchase, {order.customer.firstname}{" "}
            {order.customer.lastname}
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant="subtitle2">
            Order ref: {order.customer_reference}{" "}
          </Typography>
        </div>
        <br />
        <Button component={Link} to="/" variant="outlined" type="button">
          Back to home
        </Button>
      </React.Fragment>
    ) : (
      <div className={classes.spinner}>
        <CircularProgress />
      </div>
    );

  if (errorMessage) {
    <React.Fragment>
      <Typography variant="h5">Error: {errorMessage}</Typography>
      <br />
      <Button component={Link} to="/" variant="outlined" type="button">
        Back to home
      </Button>
    </React.Fragment>;
  }

  const Form = () =>
    activeStep === 0 ? (
      <AddressForm checkoutToken={checkoutToken} next={next} />
    ) : (
      <PaymentForm
        shippingData={shippingData}
        checkoutToken={checkoutToken}
        backStep={backStep}
        handleCaptureCheckout={handleCaptureCheckout}
        nextStep={nextStep}
      />
    );

  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.toolBar} />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography variant="h4" align="center">
            Checkout
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <Confirmation />
          ) : (
            checkoutToken && <Form />
          )}
        </Paper>
      </main>
    </React.Fragment>
  );
}
