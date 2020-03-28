import React from 'react';

type CreatePostProps = {
  postname: string,
  onChange: any,
  onCreate: any
}

function CreatePost({ postname, onChange, onCreate }: CreatePostProps) {
  return (
    <div>
      <input name="postname" placeholder="제목" onChange={onChange} value={postname} />
      <button onClick={onCreate}>등록</button>
    </div>
  );
}

export default CreatePost;