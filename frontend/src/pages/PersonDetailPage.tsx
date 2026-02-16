import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PersonDetails from '../components/PersonDetails';

function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const personId = id != null ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (Number.isNaN(personId)) {
      navigate('/trending', { replace: true });
    }
  }, [personId, navigate]);

  if (Number.isNaN(personId)) {
    return null;
  }

  return (
    <PersonDetails
      personId={personId}
      onClose={() => navigate(-1)}
    />
  );
}

export default PersonDetailPage;
