import React from 'react';

export const Box = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col flex-1 h-full w-full p-5 pt-3 bg-sky-500/10">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <div className="p-50 h-full rounded-lg bg-white ">{children}</div>
    </div>
  );
};
