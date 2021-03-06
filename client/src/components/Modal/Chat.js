import React from 'react'
import { Modal } from 'semantic-ui-react'
import NameForm from "../Form/Name";

const ChatName = (props) =>
    <Modal
    open={props.open}
    size="tiny"
    header='What is your name?'
    content={<NameForm onSubmit={props.onSubmit}/>} />


export default ChatName;