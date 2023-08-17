import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Button,
  FormControl,
  Paper,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Toggle from "./Inputs/Toggle";
import TextInput from "./Inputs/TextInput";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(5),
    backgroundColor: "#F7F9FD",
    width: "30%",
  },
  formControl: { padding: theme.spacing(2) },
  error: { color: "red" },
  button: {
    marginTop: theme.spacing(4),
    alignContent: "right",
    backgroundColor: "#3A8DFF",
    padding: "5px 30px",
    color: "#ffffff",
    fontSize: "15px",
    "&:disabled": {
      color: "#ffffff",
      fontSize: "15px",
      backgroundColor: "lightgrey",
    },
    "&:hover": {
      color: "#ffffff",
      fontSize: "15px",
      backgroundColor: "#3A8DFF",
    },
  },
}));

const Onboarding = () => {
  const classes = useStyles();
  const history = useHistory();

  const [onboardingForm, setOnboardingForm] = useState({
    isFetching: true,
  });
  const [onboardingData, setOnboardingData] = useState();

  useEffect(() => {
    const fetchOnboardingFormData = async () => {
      setOnboardingForm((prev) => ({ ...prev, isFetching: true }));
      try {
        const { data } = await axios.get("/api/onboarding");
        setOnboardingForm(data);
      } catch (error) {
        console.error(error);
      } finally {
        setOnboardingForm((prev) => ({ ...prev, isFetching: false }));
      }
    };

    fetchOnboardingFormData();
  }, []);

  const onInputChange = (event, type = "text") => {
    setOnboardingData((prevData) => {
      return {
        ...prevData,
        [event.target.name]:
          type === "checkbox" ? event.target.checked : event.target.value,
      };
    });
  };

  const saveOnboarding = () => {
    history.push({
      pathname: "/home",
      state: { onboarding: true },
    });
  };

  const renderButton = (text, onClick) => {
    return (
      <Button
        className={classes.button}
        type="submit"
        variant="contained"
        size="large"
        onClick={onClick}
        disabled={false}
      >
        {text}
      </Button>
    );
  };

  if (onboardingForm?.isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container justifyContent="center">
      <Paper className={classes.container}>
        <FormControl fullWidth className={classes.formControl}>
          <TextInput
            label={"First Name"}
            name={"firstName"}
            required={true}
            onboardingData={onboardingData}
            onChange={onInputChange}
          />
        </FormControl>

        <FormControl fullWidth className={classes.formControl}>
          <TextInput
            label={"Bio"}
            name={"bio"}
            required={true}
            onboardingData={onboardingData}
            onChange={onInputChange}
            textarea={true}
          />
        </FormControl>

        <FormControl fullWidth className={classes.formControl}>
          <Toggle
            label={"I would like to receive updates"}
            name={"receiveUpdates"}
            onChange={onInputChange}
            onboardingData={onboardingData}
          />
        </FormControl>

        <FormControl fullWidth className={classes.formControl}>
          <Typography className={classes.error}>
            Please fill all the required fields before proceeding.
          </Typography>

          <Grid justifyContent="space-between" container>
            <Grid item>
              {renderButton("Back")}
              {renderButton("Finish", saveOnboarding)}
              {renderButton("Next")}
            </Grid>
          </Grid>
        </FormControl>
      </Paper>
    </Grid>
  );
};

export default Onboarding;
