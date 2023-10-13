import { ClientSideSuspense } from '@liveblocks/react';
import CollaboradEditor from './Editor';
import { RoomProvider } from './liveblocks.config';

import './App.css';

const App = () => {
  return (
    <div className="editor-wrap">
      <RoomProvider id="my-room" initialPresence={{}}>
        <ClientSideSuspense fallback="Loading...">
          {() => <CollaboradEditor />}
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
};

export default App;
