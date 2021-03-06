// Import React
//--------------------------------------------------------
import React, { Component } from "react";
import { Divider } from "semantic-ui-react";
import { connect } from "react-redux";
import NameModal from "../../Modal/Chat";
import Panel from "../../Panel"
import MessageBox from "./MessageBox";
import InputBox from "./InputBox";
import actions from "../../../utils/actions";
import Socket from "./ChatSocket";
import SelectLobby from "./SelectLobby";

const style = {
    divider: { margin: 0 },
    notification: { textAlign: "center" },
    userContainer: { },
    cUser: { fontWeight: "bold", color: "#ee442b" },
    user: { margin: "1rem" },
}

// create Chat Box app
//--------------------------------------------------------
class ChatBoxApp extends Component {

    state = {
        name: "",
        cRoom: "lobby",
        loading: false
    }
    
    componentDidMount(){
        let name = this.props.user.name;
        if(name) {
            this.props.connectToLobby(name)
        };
        this.props.dispatch(actions.Room.findAll())
        .then(db => {
        })
        .catch(err => console.log(err));
    }

    // handle name submit
    selectName = (name) => {
        this.props.connectToLobby(name)
        this.props.dispatch(actions.User.selectname(name));
    }

    selectRoom = (id) =>         
        new Promise( (resolve, reject) => { 
            this.props.dispatch(actions.Room.findOne(id))
            .then(doc => {
                this.props.connectToRoom(this.props.cRoom)
                resolve(doc)
            })
            .catch(err => console.log(err));
        })
    
    createRoom = (room) =>
        new Promise( (resolve, reject) => {
            this.props.dispatch(actions.Room.createOne(room))
            .then(doc => resolve(doc))
            .catch(err => console.log(err));
        })

    deleteRoom = (id) => 
        new Promise( (resolve, reject) => {
            this.props.dispatch(actions.Room.deleteOne(id))
            .then(doc => resolve(doc))
            .catch(err => console.log(err));
        })
    
        
    selectLobby = (cb) => {
            // change socket cRoom to lobby
            this.props.connectToLobby();
            // change state cRoom to lobby
            this.props.dispatch(actions.Room.returnToLobby())
            .then(() => {
                if(cb){ cb() }
            })          
        }

    createPost = (post) => 
        new Promise( (resolve, reject) => {
            this.props.dispatch(actions.Post.createOne(post))
            .then(doc => {
                this.props.postMessage(post);
                resolve(doc);
            })
            .catch(err => console.log(err))
        })

    toggleLoader = () => this.setState({ loading: !this.state.loading });

    // render DOM
    render(){
        const name = this.props.user.name;
        const roomList = this.props.roomList || [];
        const cRoom = this.props.cRoom || false;
        const cUser = this.props.cUser || {};
        const privilege = this.props.user.privilege;
        const loading = this.state.loading;
        
        const notification = <h2 style={style.notification}>Select a room to join the conversation</h2>

        const users = this.props.users.filter(el => el.cRoom._id === cRoom._id) || [];
  
        return(
            <div>
                <Panel fluid as="h3" 
                loading={!this.props.roomList || loading}
                color="blue" 
                rightItem={<SelectLobby toggleLoader={this.toggleLoader} selectLobby={this.selectLobby}/>} 
                header={`Welcome ${name} ${privilege === 3 ? " -- Admin" : ""}`}>
                    <NameModal open={name.length === 0 } onSubmit={this.selectName}/>
                    <Divider style={style.divider}/>
                        <MessageBox 
                        admin={privilege === 3}
                        cRoom={cRoom}
                        users={this.props.users}
                        selectRoom={this.selectRoom}
                        createRoom={this.createRoom}
                        deleteRoom={this.deleteRoom}
                        roomList={roomList}/>
                    {cRoom ? 
                        <InputBox cRoom={cRoom} 
                        createPost={this.createPost} 
                        name={name}/> 
                    : notification}
                </Panel>
                <Panel as="h5" color="green" header="Online">
                    <div style={style.userContainer}>
                        {users.map(user => {
                            return (
                                <span key={user.id} 
                                style={user.id === cUser.id ? style.cUser : style.user}>
                                    {user.name}
                                </span>
                            )
                        })}
                    </div>
                </Panel>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return ({
        roomList: state.room.list,
        cRoom: state.room.cRoom,
        user: state.user
    })
}

ChatBoxApp = Socket(ChatBoxApp);
ChatBoxApp = connect(mapStateToProps)(ChatBoxApp);

export default ChatBoxApp;

