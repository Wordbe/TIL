import React from 'react';
import Body from './Body';

type MainProps = {
  name: String
}

function Main({ name }: MainProps) {
  return (
    <>
      <h1>Wordtory, welcome {name}</h1>
      <Body />
    </>
  )
}

Main.defaultProps = {
  name: "JIN"
}

export default Main;