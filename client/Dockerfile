FROM node:10-alpine

ENV HOME /home/react-ui/
RUN mkdir -p $HOME
WORKDIR $HOME

ENV PATH $HOME/node_modules/.bin:$PATH

COPY react-ui/package.json $HOME
RUN npm install --silent

COPY react-ui/ $HOME

EXPOSE 3000

CMD ["npm", "start"]
