import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';

const App: React.FC = () => {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://research-api-two.vercel.app/api/journals');
        setJournals(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return <Container className="mt-5 text-center"><p className="text-danger">{error}</p></Container>;
  }

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Journal List</h1>
      <Row>
        {journals.map((journal) => (
          <Col md={4} sm={6} xs={12} key={journal._id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{journal.Title}</Card.Title>
                <Card.Text>
                  <strong>Rank:</strong> {journal.Rank}<br />
                  <strong>Country:</strong> {journal.Country}<br />
                  <strong>H-index:</strong> {journal.H_index}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default App;