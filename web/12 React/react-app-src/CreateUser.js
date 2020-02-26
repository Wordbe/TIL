import React, { useRef, useContext } from 'react';
import UserDispatch from './App';
import useInputs from './hooks/useInput';

function CreateUser() {
    const [{ username,  email }, onChange, reset] = useInputs({
        username: '',
        email: ''
    });
    const nextId = useRef(4);
    const dispatch = useContext(UserDispatch);

    const onCreate = () => {
        dispatch({
            type: "CREATE_USER",
            user: {
                id: nextId.current,
                username,
                email
            }
        });
        reset();
        nextId.current += 1;
    };


    return (
        <div>
            <h2>Sign up</h2>
            <input name="username"
                placeholder="계정명" 
                onChange={onChange} 
                value={username} />
            <input name="email"
                placeholder="이메일" 
                onChange={onChange} 
                value={email} />
            <button onClick={onCreate}>등록</button>
        </div>
    );
}

export default React.memo(CreateUser);