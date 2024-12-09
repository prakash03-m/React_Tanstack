import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [isDeleting, setIsDeleting] = useState(false);

  const {data, isPending, isError, error} = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({signal}) => fetchEvent({id: params.id, signal})
  });

  const {mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: deleteError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: "none"
      })
      navigate('/events');
    }
  })

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }
  function handleDelete() {
    mutate({id: params.id});
  }
  let content ; 
  if(isPending) {
    content = (<div id="event-details-content" className='center'>
      <p>Fetching event data</p>
    </div>);
  }

  if(isError) {
    content = (<ErrorBlock title="Faile" message={error.info?.message || 'Failure in data fetch'}/>)
  }

  if(data) {

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
        </div>
      </>
    )
  }
  return (
    <>
    {isDeleting && <Modal onClose={handleStopDelete}>
      <h2>Are you sure?</h2>
      <div className='form-actions'>
        {isPendingDeletion && <p>Deleting Pls wait</p>}
        {!isPendingDeletion &&
        <>
        <button onClick={handleStopDelete}>Cancel</button>
        <button onClick={handleDelete}>Confirm</button>
        </>
      }
      </div>
      {isErrorDeleting && <ErrorBlock title="failure"/>}
    </Modal>}
      <Outlet />      
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
