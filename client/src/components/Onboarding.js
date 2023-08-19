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
  const [currentPage, setCurrentPage] = useState(1);


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


  const checkIsNextDisabled = () => {
    if (!onboardingData) {
      return true
    }
    const requiredFeilds = onboardingForm?.steps[currentPage - 1].filter((element) =>
      element.required).map(element => element.name);
    for (const feild of requiredFeilds) {
      if (typeof onboardingData[feild] === 'undefined') {
        return true
      }
    };
    return false;
  }


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


  const stepBackward = () => {
    if (currentPage === 2) {
      setCurrentPage((prevState) => prevState - 1);
    }
  };


  const stepForward = () => {
    if (currentPage === 1) {
      setCurrentPage((prevState) => prevState + 1);
    } else if (currentPage === 2) {
      saveOnboarding();
    }
  };


  const renderButton = (text, onClick, disabled = false) => {
    return (
      <Button
        className={`${classes.button}`}
        type="submit"
        variant="contained"
        size="large"
        onClick={onClick}
        disabled={disabled}
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
          {onboardingForm?.steps[currentPage - 1]?.map((element, index) => element.type === 'yes-no' ? (
            <Toggle
              key={index}
              label={element.label}
              name={element.name}
              required={element.required}
              onChange={onInputChange}
              onboardingData={onboardingData}
            />
          ) : (<TextInput
            key={index}
            label={element.label}
            name={element.name}
            required={element.required}
            onboardingData={onboardingData}
            onChange={onInputChange}
          />))}

        </FormControl>


        <Grid justifyContent="space-between" container>
          <Grid item>
            {currentPage === 2 && renderButton("Back", stepBackward)}
            {renderButton(
              currentPage === 2 ? "Finish" : "Next",
              stepForward, checkIsNextDisabled())}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default Onboarding;
