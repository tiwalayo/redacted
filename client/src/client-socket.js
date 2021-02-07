import socketIOClient from "socket.io-client";
import { post } from "./utilities";
import { navigate } from "@reach/router"

const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id }).then((resp) => {
    if (resp.ok === false){
      navigate("/", { state: { inactive: true } })
      console.log("redirecting")
    }
  });
});
