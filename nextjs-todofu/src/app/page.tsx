'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="relative overflow-hidden bg-[#F8F7F5] min-h-screen">
      {/* Yellow curved ribbon (no text) - Full screen width */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/landing/yellow-line.png"
          alt="Yellow decorative line"
          fill
          className="object-cover opacity-80"
        />
      </div>

      {/* Soft side fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F2E7DA]/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F2E7DA]/60 to-transparent z-10" />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 sm:pt-40 sm:pb-28 min-h-screen z-10">
        {/* Top tiny badge */}
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs shadow-sm ring-1 ring-black/5 backdrop-blur">
          <div className="flex -space-x-2">
            <Image
              src="/landing/6.png"
              alt=""
              width={18}
              height={18}
              className="rounded-full ring-2 ring-white"
            />
            <Image
              src="/landing/7.png"
              alt=""
              width={18}
              height={18}
              className="rounded-full ring-2 ring-white"
            />
            <Image
              src="/landing/8.png"
              alt=""
              width={18}
              height={18}
              className="rounded-full ring-2 ring-white"
            />
          </div>
          <span className="text-neutral-600">450k people have joined</span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-center text-5xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl">
          <span className="relative inline-block">
            <span className="relative z-10">Organize</span>
            <span className="absolute -inset-x-2 -bottom-1 top-4 -skew-x-6 rounded-xl bg-[#FFD7E5]"></span>
          </span>{' '}
          <span className="font-medium">everything</span>
          <br />
          <span className="font-medium">in your</span>{' '}
          <span className="text-[#7CA6E7]">life</span>
        </h1>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-white shadow-lg shadow-black/10 transition hover:translate-y-[-1px] hover:shadow-black/20"
          >
            Get Started
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 bg-white px-8 text-gray-700 shadow-sm transition hover:translate-y-[-1px] hover:shadow-lg"
          >
            Sign Up
          </Link>
        </div>

        {/* Floating cards & doodles */}
        {/* Left floating card on ribbon */}
        <div className="pointer-events-none absolute left-8 top-[45%] hidden rotate-[-8deg] sm:block">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/5">
            <div className="text-xs font-medium text-neutral-900">
              Groceries Shopping
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#E9F1FF] px-2 py-1 text-[10px] text-[#4B84FF]">
              Priority
            </div>
            <div className="mt-3 flex -space-x-2">
              <Image
                src="/landing/6.png"
                alt=""
                width={22}
                height={22}
                className="rounded-full ring-2 ring-white"
              />
              <Image
                src="/landing/7.png"
                alt=""
                width={22}
                height={22}
                className="rounded-full ring-2 ring-white"
              />
              <Image
                src="/landing/8.png"
                alt=""
                width={22}
                height={22}
                className="rounded-full ring-2 ring-white"
              />
            </div>
          </div>
        </div>

        {/* Right floating card on ribbon */}
        <div className="pointer-events-none absolute right-10 top-[36%] hidden rotate-[10deg] sm:block">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/5">
            <div className="text-xs font-medium text-neutral-900">
              Finish AI & ML Report
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#E9F1FF] px-2 py-1 text-[10px] text-[#4B84FF]">
              Priority
            </div>
            <div className="mt-3 flex -space-x-2">
              <Image
                src="/landing/9.png"
                alt=""
                width={22}
                height={22}
                className="rounded-full ring-2 ring-white"
              />
              <Image
                src="/landing/10.png"
                alt=""
                width={22}
                height={22}
                className="rounded-full ring-2 ring-white"
              />
            </div>
          </div>
        </div>

        {/* Bottom illustrations sitting along the ribbon */}
        <div className="flex flex-row items-center justify-evenly">
          <Image
            src="/landing/6.png"
            alt="doodle left"
            width={140}
            height={140}
            className="pointer-events-none absolute left-16 bottom-48 hidden drop-shadow-sm sm:block"
          />
          <Image
            src="/landing/7.png"
            alt="doodle mid-left"
            width={110}
            height={110}
            className="pointer-events-none absolute left-1/4 bottom-28 hidden drop-shadow-sm sm:block"
          />
          <Image
            src="/landing/8.png"
            alt="doodle center"
            width={160}
            height={160}
            className="pointer-events-none absolute left-1/2 bottom-12 hidden -translate-x-1/2 drop-shadow-sm sm:block"
          />
          <Image
            src="/landing/9.png"
            alt="doodle mid-right"
            width={130}
            height={130}
            className="pointer-events-none absolute right-1/4 bottom-40 hidden drop-shadow-sm sm:block"
          />
          <Image
            src="/landing/10.png"
            alt="doodle right"
            width={140}
            height={140}
            className="pointer-events-none absolute right-16 bottom-80 hidden drop-shadow-sm sm:block"
          />
        </div>
      </div>
    </section>
  );
}
