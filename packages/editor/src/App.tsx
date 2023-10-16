import { ClientSideSuspense } from '@liveblocks/react';
import CollaboradEditor from './Editor';
import { RoomProvider } from './liveblocks.config';

import './App.css';

const App = () => {
  return (
    <RoomProvider id="my-room" initialPresence={{}}>
      <ClientSideSuspense fallback="Loading...">
        {() => <CollaboradEditor />}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default App;
