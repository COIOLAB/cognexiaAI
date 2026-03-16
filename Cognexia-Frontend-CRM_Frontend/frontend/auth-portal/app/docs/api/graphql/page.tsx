'use client';

import Link from 'next/link';
import { ArrowLeft, Database, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function GraphQLApiPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8">
            <Link href="/documentation" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documentation
            </Link>
            <div className="text-sm text-muted-foreground">
              Documentation / API Reference / GraphQL API
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">GraphQL API Reference</h1>
            <p className="text-xl text-muted-foreground">
              Powerful and flexible queries with GraphQL
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <section className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-8 w-8" />
                <h2 className="text-3xl font-bold m-0">GraphQL Endpoint</h2>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <code className="text-green-400 text-lg">https://api.cognexiaai.com/graphql</code>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Basic Query</h2>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`query {
  contacts(limit: 10) {
    id
    firstName
    lastName
    email
    company
    createdAt
  }
}`}
                </pre>
              </div>

              <p className="font-semibold mb-2">Response:</p>
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`{
  "data": {
    "contacts": [
      {
        "id": "cnt_123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "company": "Acme Corp",
        "createdAt": "2026-01-15T10:00:00Z"
      }
    ]
  }
}`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Filtering & Pagination</h2>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`query {
  contacts(
    where: {
      company: { contains: "Tech" }
      createdAt: { gte: "2026-01-01" }
    }
    orderBy: { createdAt: DESC }
    skip: 0
    take: 20
  ) {
    id
    firstName
    lastName
    email
    company
    tags
  }
  
  contactsCount(
    where: {
      company: { contains: "Tech" }
    }
  )
}`}
                </pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <p className="text-sm m-0">
                  <strong>Filters:</strong> contains, equals, in, gte, lte, gt, lt, startsWith, endsWith
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Mutations</h2>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-3">Create Contact</h3>
                <div className="bg-slate-900 rounded-xl p-6">
                  <pre className="text-green-400 font-mono text-sm">
{`mutation CreateContact($input: CreateContactInput!) {
  createContact(input: $input) {
    id
    firstName
    lastName
    email
    company
    createdAt
  }
}`}
                  </pre>
                </div>

                <p className="font-semibold mb-2 mt-4">Variables:</p>
                <div className="bg-slate-900 rounded-xl p-6">
                  <pre className="text-green-400 font-mono text-sm">
{`{
  "input": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "company": "Tech Inc",
    "tags": ["lead", "enterprise"]
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-3">Update Contact</h3>
                <div className="bg-slate-900 rounded-xl p-6">
                  <pre className="text-green-400 font-mono text-sm">
{`mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
  updateContact(id: $id, input: $input) {
    id
    firstName
    lastName
    company
    tags
    updatedAt
  }
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3">Delete Contact</h3>
                <div className="bg-slate-900 rounded-xl p-6">
                  <pre className="text-green-400 font-mono text-sm">
{`mutation DeleteContact($id: ID!) {
  deleteContact(id: $id) {
    success
    message
  }
}`}
                  </pre>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Nested Queries</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`query {
  organization(id: "org_123") {
    id
    name
    employees {
      id
      firstName
      lastName
      department {
        id
        name
        manager {
          id
          firstName
          lastName
        }
      }
    }
    contacts {
      id
      firstName
      email
      deals {
        id
        title
        value
        stage
      }
    }
  }
}`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Fragments</h2>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`fragment ContactFields on Contact {
  id
  firstName
  lastName
  email
  company
  phone
  tags
}

query {
  recentContacts: contacts(
    orderBy: { createdAt: DESC }
    take: 5
  ) {
    ...ContactFields
  }
  
  enterpriseContacts: contacts(
    where: { tags: { has: "enterprise" } }
  ) {
    ...ContactFields
  }
}`}
                </pre>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Subscriptions (WebSocket)</h2>
              
              <div className="bg-slate-900 rounded-xl p-6 mb-6">
                <pre className="text-green-400 font-mono text-sm">
{`subscription OnContactCreated {
  contactCreated {
    id
    firstName
    lastName
    email
    company
    createdAt
  }
}

subscription OnDealUpdated($dealId: ID!) {
  dealUpdated(id: $dealId) {
    id
    title
    stage
    value
    updatedAt
  }
}`}
                </pre>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4">
                <p className="text-sm m-0">
                  <strong>WebSocket URL:</strong> wss://api.cognexiaai.com/graphql
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">Schema Introspection</h2>
              
              <div className="bg-slate-900 rounded-xl p-6">
                <pre className="text-green-400 font-mono text-sm">
{`query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}`}
                </pre>
              </div>

              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <p className="text-sm m-0">
                  <strong>GraphQL Playground:</strong> Visit https://api.cognexiaai.com/graphql in your browser for interactive exploration
                </p>
              </div>
            </section>

            <section className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/docs/api/rest" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">REST API →</h3>
                  <p className="text-sm text-purple-100 m-0">Traditional endpoints</p>
                </Link>
                <Link href="/docs/api/authentication" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">Authentication →</h3>
                  <p className="text-sm text-purple-100 m-0">Secure your queries</p>
                </Link>
                <Link href="/docs/developer/sdks" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                  <h3 className="font-bold mb-2">GraphQL Clients →</h3>
                  <p className="text-sm text-purple-100 m-0">Apollo, Relay, urql</p>
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
