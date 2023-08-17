import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Grid, Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(20),
  },
  button: {
    marginTop: theme.spacing(4),
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();
  const classes = useStyles();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push("/login");
      else history.push("/register");
    }
  }, [user, history, isLoggedIn]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <Grid className={classes.container}>
      <Typography variant="h4">Home Page</Typography>
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={handleLogout}
          className={classes.button}
        >
          Logout
        </Button>
      </Grid>
    </Grid>
  );
};

export default Home;
