const IndexPage = () => {
  return <a href="/start/">Start</a>;
};

export const getPageStaticProps = () => {
  return {
    redirect: {
      destination: '/start/',
      permanent: false
    }
  };
};


export default IndexPage;
