# nogales-feedback

Install angular global:

```
npm install -g @angular/cli@18.0.7
```

## Add new application
```
ng generate module views/nogales-feedback --route nogales-feedback --module app.module
```

## Add new component
ng generate component views/nogales-feedback/components/main --standalone false  --skip-tests
```


## Remove the existing module and then recreate it
```
rm -r src/app/views/nogales-feedback && ng generate module views/nogales-feedback --route nogales-feedback --module app.module