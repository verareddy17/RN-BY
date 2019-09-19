import * as React from 'react';
import { View, Text, Card, CardItem, Icon, Button, ListItem, Grid, Col, Row } from 'native-base';

const Lead = ({ lead }) => {
    return (
        <View style={{ paddingTop: 0 }}>
            <Card
                style={{
                    marginTop: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    borderTopWidth: 0,
                    borderLeftWidth: 0,
                    borderBottomWidth: 0,
                    borderRightWidth: 0,
                    borderRadius: 5,
                }}
            >
                <CardItem header style={{ paddingBottom: 0, paddingTop: 12, paddingLeft: 12, paddingRight: 12 }}>
                    <Text style={{ fontWeight: '700', fontSize: 16, color: '#555', fontFamily: 'system font' }}>{lead.name}</Text>
                    <Button
                        rounded
                        small
                        style={{
                            backgroundColor: '#813588',
                            marginLeft: 6,
                            paddingTop: 0,
                            paddingBottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 25,
                        }}
                    >
                        <Text style={{ textTransform: 'capitalize', fontSize: 12, fontFamily: 'system font' }}>
                            {lead.classes.name}
                        </Text>
                    </Button>
                </CardItem>

                <CardItem
                    style={{
                        borderBottomColor: '#f6f6f6',
                        borderBottomWidth: 1,
                        paddingTop: 10,
                        paddingBottom: 5,
                        paddingLeft: 12,
                        paddingRight: 12,
                    }}
                >
                    <Grid>
                        <Col style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="phone-portrait" style={{ fontSize: 20, width: 20, color: '#555' }} />
                            <Text style={{ marginRight: 10, fontSize: 14, color: '#555', fontFamily: 'system font' }}>
                                {lead.phone}
                            </Text>
                            <Icon name="mail" style={{ fontSize: 20, width: 25, color: '#555' }} />
                            <Text style={{ flex: 1, fontSize: 14, color: '#555', fontFamily: 'system font' }} numberOfLines={1}>
                                {lead.email}
                            </Text>
                        </Col>
                    </Grid>
                </CardItem>
                <CardItem style={{ paddingTop: 5, paddingBottom: 0, paddingLeft: 12, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Grid>
                            <Col>
                                <Text style={{ fontSize: 10, color: '#555', fontFamily: 'system font' }}>School Board</Text>
                            </Col>
                            <Col style={{ marginLeft: 20 }}>
                                <Text style={{ fontSize: 10, color: '#555', fontFamily: 'system font' }}>School</Text>
                            </Col>
                        </Grid>
                    </View>
                </CardItem>
                <CardItem style={{ paddingTop: 5, paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Grid>
                            <Col>
                                <Text style={{ flex: 1, color: '#555', fontFamily: 'system font' }} numberOfLines={1}>
                                    {lead.board.name}
                                </Text>
                            </Col>
                            <Col style={{ marginLeft: 20 }}>
                                <Text style={{ flex: 1, color: '#555', fontFamily: 'system font' }} numberOfLines={1}>
                                    {lead.school_name}
                                </Text>
                            </Col>
                        </Grid>
                    </View>
                </CardItem>
            </Card>
        </View>
    );
};
export default Lead;
