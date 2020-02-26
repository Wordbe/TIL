import { useCallback, useReducer } from 'react';

function reducer(state, action) {
    switch(action.type){
        case "CHANGE":
            return {
                ...state,
                [action.name]: action.value
            };
        case "RESET":
            return Object.keys(state).reduce((acc, current) => {
                acc[current] = '';
                return acc;
            }, {});
        default:
            return state;
    }
}

function useInputs(initialForm) {
    // 방법 1. useReducer 사용
    const [form, dispatch] = useReducer(reducer, initialForm);

    // change, 함수형 업데이트
    const onChange = useCallback(e => {
        const { name, value } = e.target;
        dispatch({
            type: "CHANGE",
            name,
            value
        });
    }, []);
    const reset = useCallback(() => dispatch({type:"RESET"}), []);

    // 방법 2. useState 사용
    // const [form, setForm] = useState(initialForm);

    // change
    // const onChanage = useCallback(e => {
    //     const { name, value } = e.target;
    //     setForm(form => (
    //         {...form, [name]: value}
    //     ));
    // }, []);
    // const reset = useCallback(() => setForm(initialForm), [initialForm]);

    return [form, onChange, reset];
}

export default useInputs;