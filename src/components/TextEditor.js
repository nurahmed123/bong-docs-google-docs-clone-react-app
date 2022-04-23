import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"
import { useParams } from "react-router-dom"
import "./TextEditor.css"

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }, { 'indent': '-1' }, { 'indent': '+1' }, { 'direction': 'rtl' }],
  ["image", "blockquote", "code-block"],
  [],
  ["clean"],
]

export default function TextEditor() {
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  const { id: documentId } = useParams()
  const SAVE_INTERVAL_MS = 2000

  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  const addToolBtn = () => {
    let mainToolBar = document.querySelector(".ql-toolbar.ql-snow");
    let newElement = document.createElement("div");
    newElement.classList.add("toggle")
    mainToolBar.appendChild(newElement)

    let btnElement = document.createElement("span");
    btnElement.classList.add("ql-formats");
    newElement.appendChild(btnElement)

    let toolsBtn = document.createElement("button")
    toolsBtn.classList.add("ql-script", "tools-btn")
    toolsBtn.value = "button"
    toolsBtn.textContent = "Save"
    btnElement.appendChild(toolsBtn);

    let toolsBtn1 = document.createElement("button")
    toolsBtn1.classList.add("ql-script", "tools-btn")
    toolsBtn1.value = "button"
    toolsBtn1.textContent = "Open"
    btnElement.appendChild(toolsBtn1);

    // const demo = document.querySelectorAll('.toggle').length;
    // if (demo === 1) {
    //   console.log("hello")
    // }

  }

  useEffect(() => {
    addToolBtn();
  }, [])


  // receive typed value 
  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return
      socket.emit("send-changes", delta)
    }
    quill.on("text-change", handler)

    return () => {
      quill.off("text-change", handler)
    }
  }, [socket, quill])


  // receive changing value 
  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta) => {
      quill.updateContents(delta)
    }
    socket.on("receive-changes", handler)

    return () => {
      quill.off("receive-changes", handler)
    }
  }, [socket, quill])

  // create users personal room 
  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once("load-document", document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit("get-document", documentId)
  }, [socket, quill, documentId])


  // save user notes to database
  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])


  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } })

    q.disable()
    q.setText("Loading...")
    setQuill(q)
  }, [])
  return <div className="container" ref={wrapperRef}></div>
}