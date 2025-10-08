import React from 'react'

const Ping = () => {
  return (
    <div className='relative'>
        <div className=" bg-red-600 rounded-full absolute -left-4 top-1">
            <span className="flex size-[11px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-ping rounded-full bg-primary opacity-75">
                    <span className="relative inline-flex size-[11px] rounded-full bg-primary"></span>
                </span>
            </span>
        </div>
    </div>
  )
}

export default Ping
