import React from 'react'
import Image from 'next/image'
import type { HomePageContent } from '@/lib/site-types'
import { FaInstagram, FaLinkedin } from 'react-icons/fa'

type TeamSectionProps = {
    team: HomePageContent['teamSection'];
};

function TeamSection({ team }: TeamSectionProps) {
    return (
        <section className='min-h-screen bg-white relative max-sm:min-h-[100svh] max-sm:overflow-hidden max-sm:py-12'>
            <div>
                <Image
                    src="/divider-shape.svg"
                    alt="Divider Shape"
                    width={1920}
                    height={889}
                    className="absolute inset-0 w-full -mt-20 brightness-200 h-full object-cover max-sm:-mt-8 max-sm:object-cover"
                />

                <div className="flex items-center justify-between flex-col gap-18 max-sm:gap-8 pb-10 ">
                    <div className="flex flex-center flex-col gap-2 text-center mt-50 max-sm:mt-20 max-sm:px-5">
                        <h2 className='text-stone-300 relative z-3 sm:text-[6rem] capitalize font-bold max-sm:text-4xl max-sm:leading-none'>{team.description}</h2>
                        <p className='text-black relative z-3 sm:text-2xl font-semibold max-sm:text-base'>{team.heading}</p>
                    </div>
                    <div className="grid relative z-2 grid-cols-2 sm:grid-cols-3 gap-12 max-sm:w-full max-sm:gap-4 max-sm:px-4">
                        {team.members.map((member) => (
                            <div  key={member.name} className="flex flex-col ">
                                <div  className="rounded-full bg-[#ebe9e8] overflow-hidden group relative hover:scale-110 duration-300 ease-in-out cursor-pointer aspect-square size-80 max-sm:size-auto max-sm:w-full max-sm:hover:scale-100">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={600}
                                        height={889}
                                        className={'h-full w-full object-cover group-hover:scale-70 duration-300 ease-out delay-100 max-sm:group-hover:scale-100'}
                                    />
                                    <div className="rounded-full max-sm:hidden flex items-center justify-center text-center flex-col ease-in group-hover:scale-120 bg-[#db612d]/80 backdrop-blur-md absolute translate-y-[100%] group-hover:translate-y-0 duration-75 left-0 m-auto z-3 top-0 aspect-square size-80 max-sm:size-full max-sm:translate-y-0 max-sm:justify-end max-sm:pb-5 max-sm:group-hover:scale-100">
                                        <span className="flex items-center justify-center duration-300 opacity-0 group-hover:opacity-100 flex-col delay-300 relative tanslate-y-30 ease-in group-hover:tranlate-y-0 max-sm:translate-y-0 max-sm:opacity-100">
                                            <h4 className='font-bold text-2xl max-sm:text-base'> {member.name}</h4>
                                            <p className='text-xs max-sm:text-[0.65rem]'>{member.role}</p>
                                        </span>
                                        <span className="flex items-center justify-center pt-4 duration-300 opacity-0 gap-2 group-hover:opacity-100 delay-300 relative tanslate-y-30 ease-in group-hover:tranlate-y-0 max-sm:translate-y-0 max-sm:pt-2 max-sm:opacity-100">
                                            <a href={member.instagram} className="hover-bg-white " target="_blank" rel="noopener noreferrer">
                                                <FaInstagram />
                                            </a>
                                            <a href={member.linkedIn} className="hover-bg-white " target="_blank" rel="noopener noreferrer">
                                                <FaLinkedin />
                                            </a>
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-full sm:hidden  flex items-center justify-center text-black text-center flex-col ease-in ">
                                        <span className="flex items-center justify-center duration-300 opacity-0 group-hover:opacity-100 flex-col delay-300 relative tanslate-y-30 ease-in group-hover:tranlate-y-0 max-sm:translate-y-0 max-sm:opacity-100">
                                            <h4 className='font-bold text-2xl max-sm:text-base'> {member.name}</h4>
                                            <p className='text-xs max-sm:text-[0.65rem]'>{member.role}</p>
                                        </span>
                                        <span className="flex items-center justify-center pt-4 duration-300 opacity-0 gap-2 group-hover:opacity-100 delay-300 relative tanslate-y-30 ease-in group-hover:tranlate-y-0 max-sm:translate-y-0 max-sm:pt-2 max-sm:opacity-100">
                                            <a href={member.instagram} className="hover-bg-white " target="_blank" rel="noopener noreferrer">
                                                <FaInstagram />
                                            </a>
                                            <a href={member.linkedIn} className="hover-bg-white " target="_blank" rel="noopener noreferrer">
                                                <FaLinkedin />
                                            </a>
                                        </span>
                                    </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>

    )
}

export default TeamSection
