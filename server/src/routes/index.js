const {graphqlHTTP} = require("express-graphql");
const createError = require("http-errors");
const {makeExecutableSchema} = require("@graphql-tools/schema");
const {constraintDirectiveTypeDefs, constraintDirective} = require("graphql-constraint-directive");

const config = require('../config');

const typeDefs = require("../gql/gql-types");
const resolvers = require("../gql/gql-resolvers");

const pageRouter = require("./pages/pageRouter");

const schema = constraintDirective()(makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
}));

const initializeRoutes = (app) => {

    app.use('/graphql', graphqlHTTP((req, res, params) => {
        return {
            graphiql: true,
            schema: schema,
            context: {req, res}
        }
    }));

    app.use('/', pageRouter);

    app.use((req, res, next) => {
        next(createError(404));
    });

    app.use((err, req, res, next) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 500);
        res.render('error', config.errorMessage404);
    });

}

module.exports = initializeRoutes;