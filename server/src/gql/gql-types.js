const typeDefs = `
    
    input GenericSignupInput {
        email: String! @constraint(format: "email")
        password: String! @constraint(minLength: 6, maxLength: 16)
    }
    
    type GenericSignupResult {
        result: Boolean!
        errorReason: String
        id: ID
    }
        
    input NewListInput {
        name: String! @constraint(minLength: 1, maxLength: 16)
    }

    type NewListAddResult {
        result: Boolean!
        errorReason: String
        id: ID
    }
    
    input ListDeleteInput {
        id: ID!
    }
    
    type ListDeleteResult {
        result: Boolean!
        errorReason: String
    }
    
    type AuthorizeResult {
        result: Boolean!
        errorReason: String
        id: ID
        email: String
    }
    
    input LogoutInput {
        all: Boolean!
    }
    
    type LogoutResult {
        result: Boolean!
        errorReason: String
    }
    
    type UserList {
        id: ID!
        name: String!
        isSocial: Boolean!
    }
    
    type UserLists {
        result: Boolean!
        errorReason: String
        lists: [UserList]
    }
    
    input UserListInput {
        listId: ID!
    }
    
    type ListData {
        result: Boolean!
        errorReason: String
        listId: ID
        listName: String
        isSocial: Boolean
        listShareId: String
        symbolsData: [Symbol]
    }
    
    type Symbol {
        symbolId: ID!
        symbol: String!,
        name: String!,
        sharesAmount: Int
        buyPrice: Float
        price: Float!
        change: Float!
        candles: Candles
    }
    
    type AllSymbols {
        result: Boolean!
        errorReason: String
        symbols: [Symbol]
    }
    
    type Candles {
        prices: [Float]
        timestamps: [Int]
    }
    
    input SymbolAddInput {
        listId: ID!
        symbol: String!
        sharesAmount: Int
        buyPrice: Float
    }
    
    type SymbolAddResult {
        result: Boolean!
        errorReason: String
    }
    
    input SymbolDeleteInput {
        listId: ID!
        symbolId: ID!
    }
    
    type SymbolDeleteResult {
        result: Boolean!
        errorReason: String
    }
        
    type Query {
        getUserLists: UserLists
        getUserListData(input: UserListInput!): ListData
        getAllSymbols: AllSymbols
    }

    type Mutation {
        genericSignup(input: GenericSignupInput!): GenericSignupResult
        genericLogin(input: GenericSignupInput!): GenericSignupResult
        logout(input: LogoutInput!): LogoutResult
        authorize: AuthorizeResult
        addNewList(input: NewListInput!): NewListAddResult
        deleteList(input: ListDeleteInput!): ListDeleteResult
        addSymbolToList(input: SymbolAddInput!): SymbolAddResult
        deleteSymbolFromList(input: SymbolDeleteInput!): SymbolDeleteResult
    }

`;

module.exports = typeDefs;