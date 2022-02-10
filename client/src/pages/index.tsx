import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { NavBar } from '../components/NavBar';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Home: NextPage = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>main page</div>
      <br />
      {data?.posts.map((p) => (!data ? <div>Loading</div> : <div key={p.id}>{p.title}</div>))}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Home);
