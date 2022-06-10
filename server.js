import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";
// json 에 "type":"module"을 사용해야 import 문법이 사용 가능함. 
// 아래와 같이도 사용 가능 함.
// const { ApolloServer, gql } = require("apollo-server")

let tweets = [
    {
        id: "1",
        text: "first one!",
        userId: "2"
    },
    {
        id: "2",
        text: "second one",
        userId: "1"
    },
];

let users = [{
    id: "1",
    firstName: "kim",
    lastName: "junsu",
},
{
    id: "2",
    firstName: "Elon",
    lastName: "Mask,"
}
]

// 쿼리 타입을 설명해주는 것은 필수다.
const typeDefs = gql`
type User {
    id:ID!
    firstName: String!
    lastName: String!
    """
    Is the sum of firstName + lastName as a string
    """
    fullName: String!
}
"""
Tweet object represents a resource for a Tweet
"""

type Tweet {
    id:ID!
    text:String!
    author:User
}
type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets:[Tweet!]!
    tweet(id:ID): Tweet
    movie(id: String!): Movie
}

type Mutation {
    postTweet(text:String!, userId: ID!): Tweet!
    """Deletes a Tweet if found, else returns false
    """ 
    
    deleteTweet(id:ID!): Boolean!
}
type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }





`;


// GET /api/v1/tweets
// POST DELETE PUT /api/v1/tweets
// GET /api/v1/tweet/:id


// resolvers 구현
const resolvers = {
    Query: {
        allTweets() {
            return tweets;
        },

        tweet(root, { id }) {
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers() {
            console.log("allUsers called!")
            return users;
        },
        allMovies() {
            return fetch
                ("http://yts.mx/api/v2/list_movies.json")
                .then((r) => r.json()).then(json => json.data.movies);
        },
        movie(_, { id }) {
            return fetch
                (`http://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
                .then((r) => r.json()).then(json => json.data.movie);
        }
    },
    Mutation: {
        // argument 순서 주의 
        postTweet(_, { text, userId }) {
            const newTweet = {
                id: tweets.length + 1,
                text
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, { id }) {
            const tweet = tweets.find(tweet => tweet.id === id);
            if (!tweet) return false;
            tweets = tweets.filter(tweet => tweet.id !== id);
            return true;
        },
    },
    User: {
        fullName({ firstName, lastName }) {
            return `${firstName} ${lastName}`;
        },
    },
    Tweet: {
        author({ userId }) {
            return users.find(user => user.id === userId);
        },
    },
};





const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
    console.log(`Running on ${url}`);

})