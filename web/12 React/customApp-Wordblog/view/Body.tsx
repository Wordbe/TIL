import React, { useState, useRef } from 'react';
import PostList from './post/PostList';
import CreatePost from './post/CreatePost';

type HeartProps = {
  heart: boolean,
  heartCount: number
};

type InputProps = {
  id: string,
  content: string
}

type PostProps = {
  postId: number,
  title: string,
  date: string
}

function Body() {

  /**
   * Heart
   */
  const [heartObj, setHeartObj] = useState<HeartProps>({
    heart: false,
    heartCount: 0
  });

  const { heart, heartCount } = heartObj;
  const onToggle = () => {
    if (!heart) {
      setHeartObj({
        heart: true,
        heartCount: heartCount + 1
      });
    }
    else {
      setHeartObj({
        heart: false,
        heartCount: heartCount - 1
      })
    }
  }

  /**
   * Input
   */
  const [inputs, setInputs] = useState<InputProps>({
    id: "",
    content: ""
  });

  const { id, content } = inputs;
  const idInput: any = useRef();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setInputs({
      ...inputs,
      [name]: value
    })
  }
  const onReset = () => {
    setInputs({
      id: "",
      content: ""
    })
    idInput.current.focus();
  }

  /**
   * Post
   */
  const [posts, setPosts] = useState<PostProps[]>(
    [
      {
        postId: 0,
        title: "주식(Stock)",
        date: "2020-03-27"

      },
      {
        postId: 1,
        title: "채권(Bond)",
        date: "2020-03-28"
      },
      {
        postId: 2,
        title: "파생상품(Derivaties)",
        date: "2020-03-29"
      }
    ]
  );
  const postsLength: number = posts.length;
  const nextId = useRef(postsLength);
  const [postInput, setPostInput] = useState({
    postname: ""
  });
  const { postname } = postInput;
  const currentDate: string = new Date().toJSON().slice(0, 10);

  const onChangePost = (e: any) => {
    const { value, name } = e.target;
    setPostInput({
      ...postInput,
      [name]: value
    })
  };

  const onCreatePost = () => {
    const post: PostProps = {
      postId: nextId.current,
      title: postname,
      date: currentDate
    }
    setPosts([...posts, post]);
    setPostInput({
      postname: ""
    });
    nextId.current += 1;
  };

  const onRemovePost = (postId: number) => {
    setPosts(posts.filter(post => post.postId !== postId));
    nextId.current -= 1;
  };

  return (
    <div>
      <div>{heartCount}</div>
      <button onClick={onToggle}>좋아요</button>
      <div>
        <input name="id" placeholder="ID" onChange={onChange} value={id} ref={idInput} />
        <input name="content" placeholder="따뜻한 말은 세상을 바꿉니다." onChange={onChange} value={content} />
        <button onClick={onReset}>Reset</button>
      </div>
      <div>미리보기: {id} {content}</div>

      <h2>Board</h2>
      <div>글 추가</div>
      <CreatePost postname={postname} onChange={onChangePost} onCreate={onCreatePost} />
      <PostList posts={posts} onRemovePost={onRemovePost} />
    </div>
  );
}

export default Body;