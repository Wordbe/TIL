import React from 'react';

type WrapperProps = {
  children: React.ReactNode
}

function Wrapper({ children }: WrapperProps) {
  const style = {
    border: '2px solid gray',
    padding: '16px',
    margin: '32px 25%'
  };
  return (
    <div style={style}>
      {children}
    </div>
  )
}

export default Wrapper;