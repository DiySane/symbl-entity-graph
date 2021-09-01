import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { ToggleOff, ToggleOn } from '@material-ui/icons';
import Link from 'next/link';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function ButtonAppBar(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <Link href="/">
            <img src="https://platform.symbl.ai/images/Symbl_LARGE_300.png" alt="logo" height="35"/>
          </Link>
          {/* https://platform.symbl.ai/images/Symbl_LARGE_300.png */}
          {/* <Typography variant="h6" className={classes.title}>
            News
          </Typography> */}
          {props.hasToggle ? <IconButton edge="end" color="inherit" onClick={() => props.setToggle(!props.toggle)}>
            {props.toggle ? <ToggleOn/> : <ToggleOff/>}
          </IconButton> : <></>}
        </Toolbar>
      </AppBar>
    </div>
  );
}