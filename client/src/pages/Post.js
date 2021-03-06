import React, { useEffect, useState } from 'react';
import CommentItem from '../components/PostPage/CommentItem';
import MainContent from '../components/PostPage/MainContent';
import WriteComment from '../components/PostPage/WriteComment';
import style from './Post.module.css';
import axios from 'axios';
import { useHistory } from 'react-router';
import { REACT_APP_API_URL } from '../config';

const Post = () => {
  const [liked, setLiked] = useState(false);
  const [pathName, setPathName] = useState('');
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState({});
  const [posts, setPosts] = useState({});

  const history = useHistory();

  const getPosts = async () => {
    try {
      const path = window.location.pathname;
      const response = await axios.get(`${REACT_APP_API_URL}${path}`, {
        withCredentials: true
      });
      const postId = response.data.posts.id;
      setAuthor(response.data.posts.user);
      setPathName(postId);
      setPosts(response.data.posts);
      getLikesState(path);
      getComments(path);
    } catch (err) {
      console.log(err);
      history.push('/404');
    }
  };

  const getComments = async (path) => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}${path}/comments`);
      setComments(response.data.comments);
    } catch (err) {
      console.log(err);
    }
  };

  const getLikesState = async (path) => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}${path}/likes`, {
        withCredentials: true
      });
      setLiked(response.data.state);
    } catch (err) {
      console.log(err);
    }
  };

  const likeHandler = async () => {
    try {
      if (!liked) {
        const liked = await axios.post(
          `${REACT_APP_API_URL}/posts/${pathName}/likes`,
          {},
          { withCredentials: true }
        );
        setLiked(true);

        if (liked.data.id) {
          const likeAdded = await axios.get(
            `${REACT_APP_API_URL}/posts/${pathName}/likes`,
            { withCredentials: true }
          );
          if (likeAdded.data.state) {
            setPosts({ ...posts, likes: posts.likes + 1 });
          }
        }
      } else {
        const unliked = await axios.delete(
          `${REACT_APP_API_URL}/posts/${pathName}/likes`,
          {
            withCredentials: true
          }
        );

        if (unliked.data.id) {
          const likeSub = await axios.get(
            `${REACT_APP_API_URL}/posts/${pathName}/likes`,
            { withCredentials: true }
          );
          if (!likeSub.data.state) {
            setPosts({ ...posts, likes: posts.likes - 1 });
          }
        }
        setLiked(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className={style.container}>
      <section>
        <MainContent
          liked={liked}
          likeHandler={likeHandler}
          posts={posts}
          author={author}
          pathName={pathName}
          setPosts={setPosts}
          name={name}
        />
        <h4 className={style.commentTitle}>??????</h4>
        {comments.map((comment) => {
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              pathName={pathName}
              setComments={setComments}
              setPosts={setPosts}
              posts={posts}
              comments={comments}
            />
          );
        })}

        <WriteComment
          pathName={pathName}
          setComments={setComments}
          comments={comments}
          setPosts={setPosts}
          posts={posts}
        />
      </section>
    </div>
  );
};

export default Post;
