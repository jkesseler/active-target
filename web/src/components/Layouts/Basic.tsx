import React from 'react';
import Container from 'react-bootstrap/Container';

interface ILayoutProps {
  children?: React.ReactNode;
}

export const BasicLayout = ({ children }: ILayoutProps) => {
  return (
    <>
      <header></header>
      <main className="my-3">
        <Container>
          {children}
        </Container>
      </main>
      <footer></footer>
    </>
  );
};
