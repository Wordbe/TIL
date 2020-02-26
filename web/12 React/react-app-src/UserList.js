import React, { useEffect, useContext } from 'react';
import { UserDispatch} from './App';

const User = React.memo(function User({ user }) {
    useEffect(()=> {
        console.log(user);
    });
    
    const dispatch = useContext(UserDispatch);

    return (
        <div>
            <b
                style={{
                    cursor: 'pointer',
                    color: user.active? 'green' : 'black'
                }}
                onClick={() => dispatch({type: "TOGGLE_USER", id: user.id})}
            >    
                {user.username}
            </b> &nbsp;
            <span>({user.email})</span>
            <button onClick={() => dispatch({type: "REMOVE_USER", id: user.id})}>삭제</button>
        </div>
    );
});

function UserList({ users }) {
    return (
        <div>
            <h2>Members</h2>
            {users.map(user => (
                <User user={user} key={user.id} />
            ))}
        </div>
    );
    
}

export default React.memo(UserList);