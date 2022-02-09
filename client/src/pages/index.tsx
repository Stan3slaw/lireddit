import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { NavBar } from '../components/NavBar';
import { createUrqlClient } from '../utils/createUrqlClient';

const Home: NextPage = () => (
  <>
    <NavBar />
    <div>main page</div>
  </>
);

export default withUrqlClient(createUrqlClient, { ssr: true })(Home);
