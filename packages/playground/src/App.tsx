// import { ClientSideSuspense } from '@liveblocks/react';
// import CollaboradEditor from 'editor';
// import { RoomProvider } from 'editor/src/liveblocks.config';

import './App.css';
import { Box } from './Box';

const App = () => {
  return (
    <div className="flex flex-col h-screen">
      <Box title="UserA">
        {/* <RoomProvider id="my-room" initialPresence={{}}>
          <ClientSideSuspense fallback="Loading...">
            {() => <CollaboradEditor />}
          </ClientSideSuspense>
        </RoomProvider> */}
        <iframe className="w-full h-full" src="http://localhost:5173/" />
      </Box>
      <Box title="UserB">
        {/* <RoomProvider id="my-room" initialPresence={{}}>
          <ClientSideSuspense fallback="Loading...">
            {() => <CollaboradEditor />}
          </ClientSideSuspense>
        </RoomProvider> */}
        <iframe className="w-full h-full" src="http://localhost:5173/" />
      </Box>
    </div>
  );
};

export default App;
