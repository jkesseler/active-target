export default function Home() {
  return (
    <p>Active Target pre-alpha</p>
  );
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/targets-demo',
      permanent: false
    }
  };
}
