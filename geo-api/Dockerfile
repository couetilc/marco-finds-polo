FROM node:10-alpine

ENV HOME /home/node-server/
RUN mkdir -p $HOME
WORKDIR $HOME

ENV PATH $HOME/node_modules/.bin:$PATH

COPY node-server/package.json $HOME/package.json
RUN npm install --silent
COPY node-server/ $HOME

CMD ["npm", "run", "dev"]
