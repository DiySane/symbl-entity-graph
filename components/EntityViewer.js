import { IconButton } from "@material-ui/core";
import { Card } from "@material-ui/core";
import { DialogContent } from "@material-ui/core";
import { CardContent } from "@material-ui/core";
import {
  Button,
  Dialog,
  DialogActions,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useState, useEffect } from "react";
import ButtonAppBar from "./ButtonAppbar";

export default function EntityViewer(props) {
  const [loaded, setLoaded] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [entities, setEntities] = useState([]);
  const [messageRefs, setMessageRefs] = useState(new Map());
  const [entityTypes, setEntityTypes] = useState(new Map());
  const [selected, setSelected] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [weightedMessages, setWeightedMessages] = useState([]);

  const [token, setToken] = useState(
    typeof window === "undefined" ? "" : localStorage.getItem("token")
  );
  const [conversationId, setConversationId] = useState(
    typeof window === "undefined" ? "" : localStorage.getItem("conversationId")
  );
  const onEntityClick = (entityText) => {
    setSelected(null);
    entities.forEach((entity) => {
      if (entity.text == entityText) {
        setSelected(entity);
        console.log(entity);
      }
    });
  };
  useEffect(() => {
    console.log(token);
    console.log(conversationId);
    fetch(
      "https://api.symbl.ai/v1/conversations/" + conversationId + "/entities",
      {
        headers: { "x-api-key": token },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        data = prepareEntities(data);
      })
      .then(() => setLoaded(true))
      .then(() => {
        prepareEdges();
      })
      .then(() => setMapLoaded(true))
      .then(() => prepareWeightedMessages());
  }, []);

  const render = () => {
    let response = "loading";
    if (!loaded) {
      response = <div>loading...</div>;
    } else if (loaded && !selected) {
      if (!toggle) {
        response = respondOnCompleteLoad(response);
      } else {
        response = respondWithWightedMessages();
      }
    } else if (selected && mapLoaded) {
      response = respondOnSelection(response);
    }
    return response;
  };

  return (
    <>
      <ButtonAppBar toggle={toggle} setToggle={setToggle} hasToggle={true} />
      {render()}
    </>
  );

  function prepareEntities(data) {
    data = data.entities;
    for (let i = 0; i < data.length; i++) {
      //   entities.push(data[i])
      let currEntity = {};
      const currentData = data[i];
      currEntity.type = currentData.type;
      currEntity.value = currentData.value;
      currEntity.text = currentData.text;
      currEntity.key = currentData.text;
      if (!entityTypes.has(currEntity.type)) {
        let entities = [];
        entities.push(currEntity);
        entityTypes.set(currEntity.type, entities);
      } else {
        entityTypes.get(currEntity.type).push(currEntity);
      }
      entities.push(currEntity);
      for (let j = 0; j < currentData.messageRefs.length; j++) {
        const currentMessage = currentData.messageRefs[j];
        if (messageRefs.get(currentMessage.id) != undefined) {
          console.log(messageRefs.get(currentMessage.id));
          let existingMessage = messageRefs.get(currentMessage.id);
          if (currEntity.text != undefined) {
            existingMessage.entities.add(currEntity.text);
          }
          messageRefs.set(currentMessage.id, existingMessage);
        } else {
          let currentEntities = new Set();
          if (currEntity.text != undefined) {
            currentEntities.add(currEntity.text);
          }
          messageRefs.set(currentMessage.id, {
            messageText: currentMessage.text,
            entities: currentEntities,
          });
        }
      }
    }
    console.log(entityTypes);
    return data;
  }

  function prepareEdges() {
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      entity.edges = new Set();
      entity.edgeList = [];
      messageRefs.forEach((msgRef) => {
        if (msgRef.entities.has(entity.text)) {
          let currentEdge = {
            message: msgRef.messageText,
            destEntities: [],
            key: entity.text,
          };
          msgRef.entities.forEach((entityText) => {
            if (entityText != entity.text) {
              entity.edges.add({
                message: msgRef.messageText,
                destEntity: entityText,
                key: entityText,
              });
              currentEdge.destEntities.push(entityText);
            }
          });
          entity.edgeList.push(currentEdge);
        }
      });
    }
  }

  function prepareWeightedMessages() {
    let unSortedArray = [];
    messageRefs.forEach((msgRef) => {
      unSortedArray.push({
        id: msgRef.id,
        message: msgRef.messageText,
        weight: msgRef.entities.size,
        entities: [...msgRef.entities],
      });
    });
    unSortedArray.sort(function (a, b) {
      var weightA = a.weight;
      var weightB = b.weight;
      if (weightA < weightB) {
        return 1;
      }
      if (weightA > weightB) {
        return -1;
      }
    });
    setWeightedMessages(unSortedArray);
  }

  function respondOnSelection() {
    let response = (
      <Dialog open={selected != null}>
        <DialogActions>
          <IconButton
            onClick={() => {
              setSelected(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          <Table>
            <TableHead>
              <TableCell style={{ fontWeight: "bold" }}>
                Source Entity
              </TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Message</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>
                Destination Entity
              </TableCell>
            </TableHead>
            {selected.edgeList.map((edge, key) => (
              <TableRow key={key}>
                <TableCell>{selected.text}</TableCell>
                <TableCell>{edge.message}</TableCell>
                <TableCell>
                  {edge.destEntities.map((dest) => (
                    <Button
                      key={dest}
                      color="primary"
                      variant="outlined"
                      style={{ padding: "10px", margin: "10px" }}
                      onClick={() => {
                        onEntityClick(dest);
                      }}
                    >
                      {dest}
                    </Button>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </DialogContent>
      </Dialog>
    );
    return response;
  }

  function respondOnCompleteLoad() {
    let response = (
      <Card raised="true">
        <CardContent style={{ backgroundColor: "lightgray" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            {[...entityTypes.keys()].map((entityType) => (
              <div key={entityType}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px",
                    background: "white",
                    justifySelf: "center",
                  }}
                >
                  <span
                    style={{
                      alignContent: "center",
                      textAlign: "center",
                      color: "white",
                      backgroundColor: "#212529",
                      padding: "10px",
                    }}
                  >
                    {entityType}
                  </span>
                  {entityTypes.get(entityType).map((entity) => (
                    <Button
                      key={entity.text}
                      color="primary"
                      variant="outlined"
                      style={{ padding: "10px", margin: "10px" }}
                      onClick={() => {
                        onEntityClick(entity.text);
                      }}
                    >
                      {entity.text}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
    return response;
  }

  function respondWithWightedMessages() {
    return (
      <Card raised="true">
        <CardContent style={{ backgroundColor: "lightgray" }}>
          <Table style={{ padding: "10px", backgroundColor: "white" }}>
            <TableHead style={{ backgroundColor: "#212529" }}>
              <TableCell
                style={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Entity Count
              </TableCell>
              <TableCell
                style={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Message
              </TableCell>
              <TableCell
                style={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Entities
              </TableCell>
            </TableHead>
            {weightedMessages.map((weightedMessage, key) => (
              <TableRow key={weightedMessage.id}>
                <TableCell style={{ textAlign: "center" }}>
                  {weightedMessage.weight}
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                  {weightedMessage.message}
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                  {[...weightedMessage.entities].map((entity) => (
                    <Button
                      key={entity}
                      color="primary"
                      variant="outlined"
                      style={{ padding: "10px", margin: "10px" }}
                      onClick={() => {
                        onEntityClick(entity);
                      }}
                    >
                      {entity}
                    </Button>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </CardContent>
      </Card>
    );
  }
}
