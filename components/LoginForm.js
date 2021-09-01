import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import { DialogContent, DialogTitle } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import { IconButton } from "@material-ui/core";
import { ArrowForward, Save } from "@material-ui/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Link from "next/link";

export default function LoginForm() {
  const [open, setOpen] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(true);
  const [token, setToken] = useState("");
  const [conversationId, setConversationId] = useState("");

  if (!dataLoaded) {
    return (
      <div className="App">
        <CircularProgress />
      </div>
    );
  }

  const storeLocally = () => {
    console.log(token);
    console.log(conversationId);
    localStorage.setItem("token", token);
    localStorage.setItem("conversationId", conversationId);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Token"
          label="Token"
          onChange={(e) => setToken(e.target.value)}
        />
        <br />
        <br />
        <TextField
          placeholder="Conversation ID"
          label="Conversation ID"
          onChange={(e) => setConversationId(e.target.value)}
        />
        <br />
        <br />
      </DialogContent>
      <DialogActions>
        <IconButton color="primary" onClick={() => storeLocally()}>
          <Save />
        </IconButton>
        <Link href="/graph">
          <div>
            <ListItemIcon>{<ArrowForward />}</ListItemIcon>
          </div>
        </Link>
      </DialogActions>
    </Dialog>
  );
}
