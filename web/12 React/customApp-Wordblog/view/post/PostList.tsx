import React, { useState } from 'react';

type PostProps = {
  postId: number,
  title: string,
  date: string
}

function Post({ post, onRemovePost }: any) {
  const [color, setColor] = useState('black');
  const onClick = () => {
    if (color === 'black') setColor('green');
    else if (color === 'green') setColor('black');
  }
  return (
    <div>
      <div>[ID: {post.postId}] 제목:
        <b
          style={{
            cursor: 'pointer',
            color: color
          }}
          onClick={onClick}
        >{post.title}</b>
      </div>
      <div>
        생성일자: {post.date}
        <button onClick={() => onRemovePost(post.postId)}>삭제</button>
      </div>
    </div>
  );
}

function PostList({ posts, onRemovePost }: any) {
  return (
    <div>
      {posts.map((post: PostProps) => {
        return <Post post={post} key={post.postId} onRemovePost={onRemovePost} />
      })}
    </div>
  );
}

export default PostList;